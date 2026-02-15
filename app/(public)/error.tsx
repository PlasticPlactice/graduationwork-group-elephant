"use client";

import React from "react";
import GenericError from "@/components/error/GenericError";

/**
 * 公開サイト（public）用のエラー画面
 * ユーザ向けに戻る・トップページへのリンクを提示
 */
export default function PublicErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GenericError
      title="エラーが発生しました"
      message="問題が発生しました。必要に応じて管理者にお問い合わせください。"
      details={error?.message}
      onRetry={reset}
      linkHref="/"
      linkLabel="トップページへ戻る"
    />
  );
}
