"use client";

import React from "react";
import GenericError from "@/components/error/GenericError";

export default function Test500Error({ error }: { error: Error }) {
  return (
    <GenericError
      title="サーバーエラーが発生しました"
      message="問題が発生しました。しばらくしてから再度お試しください。"
      onRetry={() => {}}
    />
  );
}
