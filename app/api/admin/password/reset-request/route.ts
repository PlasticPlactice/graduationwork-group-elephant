import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // バリデーション
    if (!email) {
      return NextResponse.json(
        { message: "メールアドレスが必須です" },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    // 管理者を取得
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // セキュリティ上、管理者が存在しない場合でも同じメッセージを返す
    // （メールアドレスの存在を推測されないようにするため）
    if (!admin || admin.deleted_flag) {
      return NextResponse.json(
        {
          message:
            "入力いただいたメールアドレスに、パスワードリセットリンクを送信しました。メールをご確認ください。",
        },
        { status: 200 }
      );
    }

    // ランダムなトークンを生成（32バイト = 64文字の16進数）
    const token = crypto.randomBytes(32).toString("hex");

    // トークンの有効期限を1時間後に設定
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 既存のトークンを削除
    await prisma.passwordReset.deleteMany({
      where: { admin_id: admin.id },
    });

    // 新しいトークンをデータベースに保存
    await prisma.passwordReset.create({
      data: {
        admin_id: admin.id,
        token,
        expires_at: expiresAt,
      },
    });

    // 本番環境では、ここでメール送信処理を実装
    // 現在は開発用にコンソールにリセットリンクを出力
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/password/reset?token=${token}`;
    console.log("\n=== パスワードリセットリンク ===");
    console.log(`管理者: ${email}`);
    console.log(`リセットリンク: ${resetLink}`);
    console.log(`有効期限: ${expiresAt.toLocaleString("ja-JP")}`);
    console.log("================================\n");

    return NextResponse.json(
      {
        message:
          "入力いただいたメールアドレスに、パスワードリセットリンクを送信しました。メールをご確認ください。",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
