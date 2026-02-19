/**
 * フォームエラー表示用のユーティリティ
 * 複数のエラーを管理し、フィールド別に表示する
 */

export interface FormErrors {
  [fieldName: string]: string;
}

/**
 * フィールドのエラーメッセージがあるかチェック
 */
export function hasFieldError(errors: FormErrors, fieldName: string): boolean {
  return !!errors[fieldName];
}

/**
 * フィールドのエラーメッセージを取得
 */
export function getFieldError(
  errors: FormErrors,
  fieldName: string,
): string | null {
  return errors[fieldName] || null;
}

/**
 * 複数のエラーを比較（更新判定用）
 */
export function errorsChanged(
  prevErrors: FormErrors,
  nextErrors: FormErrors,
): boolean {
  const prevKeys = Object.keys(prevErrors);
  const nextKeys = Object.keys(nextErrors);

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  return prevKeys.some((key) => prevErrors[key] !== nextErrors[key]);
}

/**
 * フォーム全体にエラーがあるかチェック
 */
export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((err) => err?.length > 0);
}

/**
 * エラーオブジェクトをクリア
 */
export function clearFormErrors(): FormErrors {
  return {};
}
