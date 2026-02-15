"use client";

import React from "react";
import GenericError from "@/components/error/GenericError";

/**
 * アプリ一般（app）用のエラー画面
 * ユーザ向けダッシュボード・トップへのリンクを提示
 */
export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GenericError
      title="エラーが発生しました"
      message="予期しないエラーが発生しました。必要に応じて管理者にお問い合わせください。"
      details={error?.message}
      onRetry={reset}
      linkHref="/app"
      linkLabel="ダッシュボードへ戻る"
    />
  );
}
