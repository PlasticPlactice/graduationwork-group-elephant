# エラーハンドリング実装ガイド

このドキュメントは、エラーハンドリング強化の実装方法を説明しています。

## 実装内容

### 1. エラー画面（領域別）

以下の 4 つのエラー画面が自動的に表示されます：

#### 404 エラー（ページが見つからない）

- ファイル: `app/not-found.tsx`
- 表示メッセージ: 「お求めのページが存在しません」
- トップページへのリンクを提示

#### 500 エラー（サーバーエラー）

- **公開側** (`app/(public)/error.tsx`): 「管理者にお問い合わせしてください」
- **ユーザー向け** (`app/(app)/error.tsx`): エラー発生の案内＋ダッシュボードへのリンク
- **管理画面** (`app/(admin)/error.tsx`): ログイン誘導＋管理ページへのリンク

### 2. グローバルトースト通知

画面右上に自動的に表示される通知システムです。

**使用方法:**

```tsx
import { useToast } from "@/contexts/ToastContext";

export default function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      type: "success",
      message: "保存しました",
      duration: 3000, // オプション：ミリ秒（デフォルト 3000）
    });
  };

  const handleError = () => {
    addToast({
      type: "error",
      message: "エラーが発生しました",
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>成功</button>
      <button onClick={handleError}>エラー</button>
    </div>
  );
}
```

**トースト種別:**

- `success`: 緑色（成功）
- `error`: 赤色（エラー）
- `warning`: 黄色（警告）
- `info`: 青色（情報）

### 3. フォーム入力エラー表示

フィールド直下にエラーメッセージを表示し、送信時にフォーム上部にエラーサマリを表示します。

**使用方法:**

```tsx
import { useState } from "react";
import {
  FormErrorMessage,
  FormErrorSummary,
  FormField,
} from "@/components/ui/FormError";
import { useToast } from "@/contexts/ToastContext";
import {
  fetchWithErrorHandling,
  ApiError,
} from "@/lib/api/fetchWithErrorHandling";
import type { FormErrors } from "@/lib/formErrorUtils";

export default function MyForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // エラーをクリア
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await fetchWithErrorHandling("/api/users", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      addToast({
        type: "success",
        message: "登録しました",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        // フィールド別エラーがある場合
        if (error.fields) {
          setErrors(error.fields);
        } else {
          // サーバーエラーはトーストで表示
          addToast({
            type: "error",
            message: error.message,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* エラーサマリ（上部） */}
      <FormErrorSummary errors={errors} />

      {/* フィールド */}
      <FormField error={errors.name} label="名前">
        <input
          type="text"
          name="name"
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </FormField>

      <FormField error={errors.email} label="メールアドレス">
        <input
          type="email"
          name="email"
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </FormField>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
```

### 4. API呼び出し時のエラーハンドリング

`fetchWithErrorHandling` ラッパーで統一されたエラー処理を行います。

**例： 単純な成功/失敗処理**

```tsx
import {
  fetchWithErrorHandling,
  ApiError,
} from "@/lib/api/fetchWithErrorHandling";
import { useToast } from "@/contexts/ToastContext";

export default function MyComponent() {
  const { addToast } = useToast();

  const handleUpdate = async () => {
    try {
      const data = await fetchWithErrorHandling("/api/users/1", {
        method: "PUT",
        body: JSON.stringify({ name: "新しい名前" }),
      });

      addToast({
        type: "success",
        message: "更新しました",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: "error",
          message: error.message,
        });
        console.error("エラーコード:", error.code); // 内部用
      }
    }
  };

  return <button onClick={handleUpdate}>更新</button>;
}
```

## API エラーレスポンス仕様

API は以下の形式でエラーを返してください：

```typescript
// 成功時
{
  "data": { /* ... */ }
}

// バリデーションエラー（400）
{
  "message": "入力に誤りがあります",
  "fields": {
    "name": "名前は必須です",
    "email": "メールアドレスの形式が正しくありません"
  }
}

// 認証エラー（401）
{
  "message": "ログインしてください",
  "code": "UNAUTHORIZED"
}

// 一般エラー（500等）
{
  "message": "予期しないエラーが発生しました",
  "code": "INTERNAL_ERROR"
}
```

## 修正済みコンポーネント

以下のコンポーネントは `alert()` から `useToast` に置換済みです：

- `components/admin/StatusEditModal.tsx` - ステータス更新時の通知
- `components/admin/AllMessageSendModal.tsx` - メッセージ送信時の通知

その他の `alert()` 使用箇所も同様のパターンで置換できます。

## セキュリティ考慮事項

- ユーザ向けのエラーメッセージには、DB エラーや内部情報を含めない
- 開発環境でも、本番環境でも同じ形式のメッセージ（`message` フィールド）が返される
- スタックトレースなどの詳細情報は、サーバーログに保存される（今回は実装していません）

## アクセシビリティ対応

- エラーメッセージ： `role="alert"` / `aria-live="assertive"` で検知可能
- フォーム送信失敗時：最初のエラー要素へフォーカス移動（コンポーネントで実装可能）
- コントラスト：CSS変数 `--color-warning` （赤）で十分な視認性確保

## テスト方法（開発環境）

### 404 エラー表示

ブラウザで存在しないURLにアクセス：

```
http://localhost:3000/non-existent-page
```

### 500 エラー表示

コンポーネント内で intentionally error を throw：

```tsx
throw new Error("Test error");
```

### トースト通知テスト

コンソールで実行：

```typescript
// ToastProviderが有効なページで実行
const { addToast } = useToast();
addToast({ type: "success", message: "テスト通知" });
```

### フォームエラー表示テスト

フォームの必須項目を空で送信し、エラーメッセージ確認

## 今後の拡張

- **エラートレーシング**: Sentry 等の外部サービス統合（将来実装予定）
- **ログ保存**: エラーをDBやファイルに記録する仕組み（今回は実装していません）
- **自動リトライ**: ネットワークエラー時の自動再試行（低リスクAPIに限定推奨）
- **多言語対応**: 英語等の対応が必要な場合は i18n ライブラリ導入

---

**最終確認項目:**

- [ ] エラー画面（404/500）が各領域で表示されることを確認
- [ ] `useToast` でトースト通知が表示されることを確認
- [ ] フォームエラー（フィールド直下 + サマリ）が表示されることを確認
- [ ] API エラークエリーが正しくエラーメッセージを返していることを確認
