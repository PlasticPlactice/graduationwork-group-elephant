import { ErrorResponse, getErrorMessageByStatus } from "@/lib/errorTypes";

/**
 * API 呼び出し用のラッパー関数
 * エラー形状の統一、ステータス判定、メッセージ抽出を行う
 *
 * 使用例:
 * try {
 *   const data = await fetchWithErrorHandling('/api/users', { method: 'POST', body: JSON.stringify(...) });
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.message); // ユーザ向けメッセージ
 *     console.log(error.fields); // フォーム検証エラー
 *   }
 * }
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public fields?: Record<string, string>,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchWithErrorHandling<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // ステータスに応じた処理
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData: ErrorResponse | null = null;

      // JSON レスポンスを試す
      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          // JSON パース失敗時は null のまま
        }
      }

      // エラーオブジェクトを構築
      const message =
        errorData?.message || getErrorMessageByStatus(response.status);
      const error = new ApiError(
        response.status,
        message,
        errorData?.fields,
        errorData?.code,
      );

      throw error;
    }

    // 正常系：JSON をパース
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return data as T;
    }

    // JSON でない場合はレスポンス本体を返す
    return response as unknown as T;
  } catch (error) {
    // fetch 自体のエラー（ネットワーク問題など）
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "ネットワークエラーが発生しました。接続を確認してください。",
        undefined,
        "NETWORK_ERROR",
      );
    }

    // 予期しないエラー
    throw new ApiError(
      500,
      "予期しないエラーが発生しました。管理者にお問い合わせしてください。",
      undefined,
      "UNKNOWN_ERROR",
    );
  }
}
