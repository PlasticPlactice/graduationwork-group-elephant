"use client";

import React from "react";
import GenericError from "@/components/error/GenericError";

/**
 * 管理画面（admin）用のエラー画面
 * ログイン誘導・権限情報を提示
 */
export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  

  // 401/403 の場合はログインページへ遷移を提案
  const isAuthError =
    error?.message?.includes("401") ||
    error?.message?.includes("403") ||
    error?.message?.includes("권限");

  if (isAuthError) {
    return (
      <GenericError
        title="認証が必要です"
        message="管理画面にアクセスするにはログインが必要です。"
        linkHref="/admin"
        linkLabel="ログインページへ"
      />
    );
  }

  return (
    <GenericError
      title="管理画面でエラーが発生しました"
      message="管理画面内でエラーが発生しました。必要に応じて管理者にお問い合わせください。"
      details={error?.message}
      onRetry={reset}
      linkHref="/admin"
      linkLabel="管理ページへ戻る"
    />
  );
}
