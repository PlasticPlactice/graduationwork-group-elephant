"use client";

import React from "react";
import { FormErrors } from "@/lib/formErrorUtils";

/**
 * フィールド直下に表示するエラーメッセージコンポーネント
 * 使用例:
 * <input name="email" />
 * <FormErrorMessage error={errors.email} />
 */
export function FormErrorMessage({
  error,
  id,
}: {
  error?: string | null;
  id?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <div
      id={id}
      className="mt-1 text-sm font-medium"
      style={{ color: "var(--color-warning)" }}
      role="alert"
    >
      {error}
    </div>
  );
}

/**
 * フォーム上部に表示するエラーサマリコンポーネント
 * 複数のエラーを一覧表示
 * 使用例:
 * <FormErrorSummary errors={errors} />
 */
export function FormErrorSummary({
  errors,
  title = "以下のエラーを修正してください：",
}: {
  errors: FormErrors;
  title?: string;
}) {
  const errorList = Object.entries(errors)
    .filter(([, msg]) => msg)
    .map(([field, msg]) => ({ field, message: msg }));

  if (errorList.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-6 p-4 rounded-lg border-l-4"
      style={{
        backgroundColor: "rgba(255, 0, 0, 0.05)",
        borderColor: "var(--color-warning)",
      }}
      role="alert"
    >
      <h3 className="font-bold mb-2" style={{ color: "var(--color-warning)" }}>
        {title}
      </h3>
      <ul className="space-y-1">
        {errorList.map(({ field, message }) => (
          <li
            key={field}
            className="text-sm"
            style={{ color: "var(--color-warning)" }}
          >
            • {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 入力フィールドのコンテナコンポーネント
 * エラー時に border-color を変更
 * 使用例:
 * <FormField error={errors.name}>
 *   <input name="name" />
 * </FormField>
 */
export function FormField({
  error,
  children,
  label,
}: {
  error?: string | null;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}
      <div
        className={
          error ? "rounded border-2" : "rounded border border-gray-300"
        }
        style={error ? { borderColor: "var(--color-warning)" } : undefined}
      >
        {children}
      </div>
      {error && <FormErrorMessage error={error} />}
    </div>
  );
}
