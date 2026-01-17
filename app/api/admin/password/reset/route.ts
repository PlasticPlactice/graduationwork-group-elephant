import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword, confirmPassword } = body;

    // バリデーション
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "すべてのフィールドが必須です" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "新しいパスワードが一致しません" },
        { status: 400 }
      );
    }

    const passwordComplexityRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

    if (!passwordComplexityRegex.test(newPassword)) {
      return NextResponse.json(
        {
          message:
            "パスワードは8文字以上で、英字・数字・記号をそれぞれ1文字以上含めてください",
        },
        { status: 400 }
      );
    }

    // トークンを検索
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { message: "無効なリセットリンクです" },
        { status: 400 }
      );
    }

    // トークンの有効期限をチェック
    if (new Date() > passwordReset.expires_at) {
      // 期限切れのトークンを削除
      await prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });

      return NextResponse.json(
        {
          message:
            "リセットリンクの有効期限が切れています。もう一度パスワードリセット手続きを行ってください",
        },
        { status: 400 }
      );
    }

    // 管理者が削除済みかチェック
    if (passwordReset.admin.deleted_flag) {
      return NextResponse.json(
        { message: "このアカウントは削除済みです" },
        { status: 403 }
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // パスワードを更新
    await prisma.admin.update({
      where: { id: passwordReset.admin_id },
      data: {
        password: hashedNewPassword,
        updated_at: new Date(),
      },
    });

    // 使用済みのトークンを削除
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json(
      { message: "パスワードが正常に変更されました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
