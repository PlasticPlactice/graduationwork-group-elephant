"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    // TODO: パスワード変更のロジックを実装
    console.log("パスワード変更処理を実行します");
    console.log({
      currentPassword,
      newPassword,
      confirmPassword,
    });
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
              className="w-full text-white px-4 py-3 rounded-md font-bold text-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "var(--color-main)",
              }}
            >
              パスワードを変更する
            </button>
            <Link href="/poster/mypage">
              <button
                type="button"
                className="w-full px-4 py-3 rounded-md font-bold text-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
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
