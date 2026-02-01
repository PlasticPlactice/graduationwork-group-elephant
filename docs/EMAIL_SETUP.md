# パスワードリセットメール設定ガイド

このガイドでは、管理者パスワードリセット機能のメール送信を設定する方法を説明します。

## 概要

パスワードリセット機能は、以下の2つのモードで動作します：

1. **メール送信モード（本番環境推奨）**: SMTP設定が完了している場合、リセットリンクがメールで送信されます
2. **コンソール出力モード（開発環境）**: SMTP設定がない場合、リセットリンクがサーバーコンソールに出力されます

## メール送信の設定

### 1. 環境変数の設定

`.env`ファイル（または環境変数）に以下の設定を追加してください：

```env
# SMTP設定
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@example.com"
```

### 2. Gmail を使用する場合

1. Googleアカウントで2段階認証を有効にします
2. [アプリパスワード](https://myaccount.google.com/apppasswords)を生成します
3. 生成されたアプリパスワードを`SMTP_PASSWORD`に設定します

例：
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="admin@yourcompany.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"
SMTP_FROM="noreply@yourcompany.com"
```

### 3. その他のSMTPプロバイダー

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

#### AWS SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-aws-smtp-username"
SMTP_PASSWORD="your-aws-smtp-password"
```

#### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-password"
```

## 動作確認

### メール送信のテスト

1. サーバーを起動します：
   ```bash
   npm run dev
   ```

2. パスワードリセットページにアクセス：
   ```
   http://localhost:3000/admin/password/reset-request
   ```

3. 管理者のメールアドレスを入力して送信

4. **メール設定が完了している場合**:
   - 入力したメールアドレスにリセットメールが届きます
   - サーバーコンソールに「Password reset email sent to: email@example.com」と表示されます

5. **メール設定が未完了の場合**:
   - サーバーコンソールにリセットリンクが出力されます
   - メールは送信されません

## トラブルシューティング

### メールが届かない場合

1. **環境変数を確認**:
   - すべてのSMTP設定が正しく設定されているか確認
   - `.env`ファイルがプロジェクトルートにあるか確認

2. **認証情報を確認**:
   - SMTP_USERとSMTP_PASSWORDが正しいか確認
   - Gmailの場合、アプリパスワードを使用しているか確認

3. **サーバーログを確認**:
   - コンソールにエラーメッセージが表示されていないか確認
   - 「Failed to send password reset email」というエラーがある場合、SMTP設定に問題があります

4. **ファイアウォール/ネットワーク**:
   - サーバーからSMTPポート（通常587または465）への接続が許可されているか確認

### よくあるエラー

**「Invalid login」エラー**:
- 認証情報が正しくありません
- Gmailの場合、アプリパスワードを使用してください

**「Connection timeout」エラー**:
- SMTP_HOSTまたはSMTP_PORTが正しくありません
- ファイアウォールでポートがブロックされている可能性があります

**メールが迷惑メールフォルダに入る**:
- SPF、DKIM、DMARCレコードを設定してください
- 信頼性の高いSMTPプロバイダー（SendGrid、AWS SESなど）の使用を検討してください

## 本番環境での推奨事項

1. **専用のメールサービスを使用**:
   - SendGrid、AWS SES、Mailgunなどのトランザクションメールサービスを推奨
   - Gmailは開発環境のみでの使用を推奨

2. **環境変数の保護**:
   - SMTP認証情報を環境変数で管理
   - `.env`ファイルをgitignoreに追加（既に追加済み）

3. **送信制限の確認**:
   - 使用するSMTPプロバイダーの送信制限を確認
   - 必要に応じてレート制限を実装

4. **メールテンプレートのカスタマイズ**:
   - `lib/email.ts`の`sendPasswordResetEmail`関数を編集
   - 会社のブランディングに合わせてHTMLテンプレートを修正

## 開発環境での使用

開発環境でメール設定を行わない場合：
- リセットリンクはサーバーコンソールに出力されます
- コンソールからリンクをコピーしてブラウザで開いてください
- これにより、メール設定なしでも機能をテストできます
