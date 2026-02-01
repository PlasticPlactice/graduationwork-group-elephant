import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PUT(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // バリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "すべてのフィールドが必須です" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "新しいパスワードが一致しません" },
        { status: 400 },
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
        { status: 400 },
      );
    }

    const adminId = parseInt(user.id);

    // 管理者を取得
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "管理者が見つかりません" },
        { status: 404 },
      );
    }

    // 削除済み管理者のチェック
    if (admin.deleted_flag) {
      return NextResponse.json(
        { message: "このアカウントは削除済みです" },
        { status: 403 },
      );
    }

    // 現在のパスワードを検証
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "現在のパスワードが正しくありません" },
        { status: 401 },
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // パスワードを更新
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedNewPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "パスワードが正常に変更されました" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
