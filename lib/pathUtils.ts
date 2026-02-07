/**
 * ファイルパスとURL処理のユーティリティ関数
 * お知らせ画像やファイルのパス処理を統一的に扱うためのヘルパー
 */

/**
 * ファイルパスの先頭に "/" を付与して正規化
 * @param path - 正規化するパス
 * @returns 先頭に "/" が付いたパス
 */
export function normalizeFilePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * 文字列が完全URL（http/https）かどうかを判定
 * @param path - 判定する文字列
 * @returns 完全URLの場合 true
 */
export function isAbsoluteUrl(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

/**
 * 完全URLからパス部分のみを抽出（比較用）
 * 相対パスの場合は正規化して返す
 * @param path - 完全URLまたは相対パス
 * @returns パス部分（例: "/uploads/image.jpg"）、エラー時や null の場合は null
 */
export function extractPathFromUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;

  try {
    // 完全URLの場合、パス部分のみを抽出
    if (isAbsoluteUrl(path)) {
      return new URL(path).pathname;
    }
  } catch (e) {
    // URLのパースに失敗した場合は無視して相対パスとして扱う
    console.warn(`Failed to parse URL: ${path}`, e);
  }

  // 相対パスの場合は正規化
  return normalizeFilePath(path);
}

/**
 * 環境に応じて相対パスを完全URLに変換
 * 既に完全URLの場合はそのまま返す
 * @param path - 変換するパス
 * @param forceAbsolute - true の場合、本番環境でなくても完全URLに変換
 * @returns 完全URLまたは相対パス
 */
export function toAbsoluteUrl(
  path: string,
  forceAbsolute: boolean = false,
): string {
  // 既に完全URLの場合はそのまま返す
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalized = normalizeFilePath(path);

  // 環境変数からベースURLを取得
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || "";

  // 本番環境かどうかを判定（localhostを含まない場合）
  const isProduction = baseUrl && !baseUrl.includes("localhost");

  // 本番環境または強制フラグが立っている場合、/uploads/ パスのみ完全URLに変換
  if ((isProduction || forceAbsolute) && normalized.startsWith("/uploads/")) {
    return baseUrl + normalized;
  }

  // その他の場合は相対パスのまま返す
  return normalized;
}

/**
 * 2つのパスを比較（完全URLと相対パスを正規化して比較）
 * @param path1 - 比較する1つ目のパス
 * @param path2 - 比較する2つ目のパス
 * @returns パスが一致する場合 true
 */
export function isSamePath(
  path1: string | null | undefined,
  path2: string | null | undefined,
): boolean {
  const normalized1 = extractPathFromUrl(path1);
  const normalized2 = extractPathFromUrl(path2);

  if (!normalized1 || !normalized2) {
    return false;
  }

  return normalized1 === normalized2;
}

/**
 * 画像ファイルかどうかを判定
 * @param filename - ファイル名またはパス
 * @returns 画像ファイルの場合 true
 */
export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
}

/**
 * PDFファイルかどうかを判定
 * @param filename - ファイル名またはパス
 * @returns PDFファイルの場合 true
 */
export function isPdfFile(filename: string): boolean {
  return /\.pdf$/i.test(filename);
}
