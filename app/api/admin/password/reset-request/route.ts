import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email";
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

    // リセットリンクを生成
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/password/reset?token=${token}`;

    // メール送信設定が完了している場合はメールを送信、そうでない場合はコンソールに出力
    if (isEmailConfigured()) {
      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (error) {
        console.error("Email send error:", error);
        // メール送信に失敗してもトークンは作成されているので、
        // 開発用にコンソールにもリンクを出力
        console.log("\n=== パスワードリセットリンク（メール送信失敗） ===");
        console.log(`管理者: ${email}`);
        console.log(`リセットリンク: ${resetLink}`);
        console.log(`有効期限: ${expiresAt.toLocaleString("ja-JP")}`);
        console.log("==========================================\n");
      }
    } else {
      // メール設定が未完了の場合はコンソールに出力（開発環境用）
      console.log("\n=== パスワードリセットリンク ===");
      console.log(`管理者: ${email}`);
      console.log(`リセットリンク: ${resetLink}`);
      console.log(`有効期限: ${expiresAt.toLocaleString("ja-JP")}`);
      console.log("================================\n");
    }

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
