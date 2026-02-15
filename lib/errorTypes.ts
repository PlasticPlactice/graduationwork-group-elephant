/**
 * 統一的なエラーメッセージ型定義
 * API とフロント間で一貫したエラー情報をやり取りするための仕様
 */

export interface ErrorResponse {
  /** エラーコード（内部用、表示されない） */
  code?: string;
  /** ユーザ向けエラーメッセージ（日本語） */
  message: string;
  /** フィールド単位のエラー（フォーム検証時に使用） */
  fields?: Record<string, string>;
}

/**
 * グローバルトースト通知の型
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number; // ミリ秒（デフォルト 3000）
}

/**
 * よく使うエラーメッセージ定義（日本語応答用）
 */
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "入力に誤りがあります。確認してください。",
  REQUIRED_FIELD: "必須項目です",
  INVALID_FORMAT: "形式が正しくありません",
  INVALID_DATE: "日付が不正です（YYYY-MM-DD 形式で入力してください）",
  DATE_RANGE_INVALID: "開始日時は終了日時より前にしてください",
  UNAUTHORIZED: "ログインしてください",
  FORBIDDEN: "この操作を実行する権限がありません",
  NOT_FOUND: "お求めのページが存在しません",
  INTERNAL_ERROR:
    "予期しないエラーが発生しました。管理者にお問い合わせしてください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
  ALREADY_EXISTS: "既に存在しています。別の値を入力してください。",
};

/**
 * HTTPステータスコードに基づく デフォルトエラーメッセージ取得
 */
export function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.ALREADY_EXISTS;
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.INTERNAL_ERROR;
    default:
      return ERROR_MESSAGES.INTERNAL_ERROR;
  }
}
