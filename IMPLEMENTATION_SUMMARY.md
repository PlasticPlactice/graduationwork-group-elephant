# エラーハンドリング実装サマリ

**実装日**: 2026-02-15  
**ステータス**: 完了 ✅

## 実装内容

### 新規作成ファイル

| ファイル                            | 説明                               |
| ----------------------------------- | ---------------------------------- |
| `lib/errorTypes.ts`                 | エラー型定義・エラーメッセージ定数 |
| `lib/formErrorUtils.ts`             | フォームエラー管理ユーティリティ   |
| `lib/api/fetchWithErrorHandling.ts` | 統一されたAPI呼び出しラッパー      |
| `contexts/ToastContext.tsx`         | トースト通知のContext・Hook        |
| `components/ui/ToastContainer.tsx`  | トースト表示UI                     |
| `components/ui/FormError.tsx`       | フォームエラー表示コンポーネント   |
| `app/(public)/error.tsx`            | 公開側 500 エラー画面              |
| `app/(app)/error.tsx`               | ユーザー向け 500 エラー画面        |
| `app/(admin)/error.tsx`             | 管理画面 500 エラー画面            |
| `app/not-found.tsx`                 | 404 エラー画面（全領域共通）       |
| `docs/ERROR_HANDLING_GUIDE.md`      | 使用ガイド・実装例ドキュメント     |

### 修正ファイル

| ファイル                                             | 変更内容                                              |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `app/providers.tsx`                                  | ToastProvider を統合                                  |
| `components/admin/StatusEditModal.tsx`               | alert() → useToast に置換（成功・失敗通知）           |
| `components/admin/AllMessageSendModal.tsx`           | alert() → useToast に置換（検証・成功・失敗通知）     |
| `components/modals/BookReviewDeleteConfirmModal.tsx` | alert() → useToast に置換（削除成功/失敗の通知）      |
| `app/(app)/post/post/page.tsx`                       | 下書き保存で alert → useToast に置換（成功/失敗）     |
| `app/(app)/post/post-confirm/page.tsx`               | 投稿作成／編集で alert → useToast に置換（成功/失敗） |
| `app/(app)/post/post-confirm/page.tsx`               | 投稿作成/編集時に `public_flag` に応じて「公開/非公開/下書き」メッセージを表示 |
| `app/(admin)/admin/register-notice/page.tsx`         | ファイルアップロード成功時に success トーストを追加 |
| `app/(admin)/admin/edit-notice/page.tsx`             | ファイルアップロード成功時に success トーストを追加 |

## 主な機能

### 1. エラー画面

- **404**: 共通 not-found.tsx でユーザ向けメッセージ表示
- **500**: 領域別（public/app/admin）でカスタマイズされた エラー画面表示
  - 開発環境ではエラー詳細情報を表示
  - 本番環境ではユーザ向け簡潔メッセージのみ表示

### 2. グローバルトースト通知

- 画面右上に自動表示
- 4 種別: success（緑）/ error（赤）/ warning（黄）/ info（青）
- 自動非表示（デフォルト 3 秒）
- Accessibility: role="alert" / aria-live="polite"

### 3. フォームエラー表示

- **フィールド直下**: 短いエラーメッセージ（赤字）
- **フォーム上部**: エラーサマリ（role="alert"）で全エラーを一覧表示
- border-color 変更でビジュアルフィードバック

### 4. 統一 API ラッパー

- `fetchWithErrorHandling()` で全 API 呼び出しを統一
- ステータスコード判定・JSON パース・エラー型変換を自動化
- ApiError クラスで型安全なエラーハンドリング

## エラーメッセージ仕様

```typescript
{
  code?: string;              // 内部用（表示されない）
  message: string;            // ユーザ向け日本語メッセージ
  fields?: Record<string, string>; // フィールド別バリデーションエラー
}
```

## セキュリティ & アクセシビリティ

✅ ユーザ向けメッセージに内部情報（DB エラー等）を含めない  
✅ role="alert" / aria-live で画面リーダー対応  
✅ カラーコントラスト：CSS 変数で統一（`--color-warning` = 赤）  
✅ フォーカイスハンドリング対応（実装時に各フォームで設定可能）

## 次のステップ（今後の改善候補）

- [ ] **エラートレーシング**: Sentry 等外部サービス統合
- [ ] **ログ保存**: DB またはファイルにエラーを記録
- [ ] **自動リトライ**: 一時的なネットワークエラー時の再試行ロジック
- [ ] **E2E テスト**: Playwright / Cypress で 404/500/フォームエラーを自動テスト
- [ ] **運用ルール**: エラー発生時の対応フロー明確化

## 検証チェックリスト

開発環境で以下を確認してください：

- [ ] http://localhost:3000/nonexistent → 404 画面表示確認
- [ ] 管理画面で API エラー発生 → エラー画面またはトースト表示確認
- [ ] StatusEditModal / AllMessageSendModal で成功/失敗時のトースト表示確認
- [ ] フォーム必須項目を空で送信 → フィールド直下＋上部にエラーメッセージ表示確認
- [ ] `useToast` で手動トースト追加 → 画面右上に表示確認

---

**質問・追加実装があればお知らせください。**
