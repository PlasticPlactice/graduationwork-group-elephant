import nodemailer from "nodemailer";

// メール送信設定
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * パスワードリセットメールを送信
 * @param to 送信先メールアドレス
 * @param resetLink リセットリンク
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "【管理画面】パスワードリセットのご案内",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">パスワードリセットのご案内</h2>
        <p>管理画面のパスワードリセットリクエストを受け付けました。</p>
        <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            パスワードをリセット
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          このリンクの有効期限は1時間です。<br>
          もしこのメールに心当たりがない場合は、このメールを無視してください。
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          このメールは自動送信されています。返信しないでください。
        </p>
      </div>
    `,
    text: `
パスワードリセットのご案内

管理画面のパスワードリセットリクエストを受け付けました。

以下のリンクをクリックして、新しいパスワードを設定してください。

${resetLink}

このリンクの有効期限は1時間です。
もしこのメールに心当たりがない場合は、このメールを無視してください。

---
このメールは自動送信されています。返信しないでください。
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${to}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("メール送信に失敗しました");
  }
}

/**
 * メール送信の設定を検証
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}
