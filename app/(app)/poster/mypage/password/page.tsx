"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    // バリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("すべてのフィールドを入力してください");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("パスワードが正常に変更されました");
        // 2秒後にマイページへ遷移
        setTimeout(() => {
          router.push("/poster/mypage");
        }, 2000);
      } else {
        setError(data.message || "パスワード変更に失敗しました");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setError("エラーが発生しました。もう一度お試しください");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-4 box-border">
      {/* ヘッダー */}
      <div className="text-center mt-3">
        <div className="flex items-center justify-start gap-2 mb-4">
          <Link
            href="/poster/mypage"
            className="font-bold text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
            aria-label="マイページへ戻る"
          >
            <span aria-hidden="true">&lt;</span> 戻る
          </Link>
        </div>
        <h1 className="text-lg font-bold text-slate-900">パスワードの変更</h1>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto my-8">
        <div
          className="bg-white rounded-lg p-6 border-2"
          style={{ borderColor: "var(--color-sub)" }}
        >
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-rose-100 border border-rose-500 text-rose-700 rounded">
              {error}
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-500 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* 現在のパスワード入力フィールド */}
          <div className="mb-6">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              現在のパスワード <span className="text-rose-500">*</span>
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
              style={{
                borderColor: "var(--color-sub)",
              }}
              placeholder="現在のパスワードを入力してください"
            />
          </div>

          {/* 新規パスワード入力フィールド */}
          <div className="mb-6">
            <label
              htmlFor="newPassword"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              新しいパスワード <span className="text-rose-500">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
              style={{
                borderColor: "var(--color-sub)",
              }}
              placeholder="新しいパスワードを入力してください"
            />
          </div>

          {/* 新規パスワード（確認）入力フィールド */}
          <div className="mb-8">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              新しいパスワード（確認） <span className="text-rose-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
              style={{
                borderColor: "var(--color-sub)",
              }}
              placeholder="新しいパスワードをもう一度入力してください"
            />
          </div>

          {/* ボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full text-white px-4 py-3 rounded-md font-bold text-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-main)",
              }}
            >
              {isLoading ? "変更中..." : "パスワードを変更する"}
            </button>
            <Link href="/poster/mypage">
              <button
                type="button"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-md font-bold text-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#6B7280",
                  borderColor: "#D1D5DB",
                }}
              >
                キャンセル
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
