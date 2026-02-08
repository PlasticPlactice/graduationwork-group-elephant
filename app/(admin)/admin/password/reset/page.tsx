"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DEMO_MODE } from "@/lib/constants/demoMode";

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // バリデーション
    if (!newPassword || !confirmPassword) {
      setMessage("すべてのフィールドを入力してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("新しいパスワードが一致しません。");
      return;
    }

    const passwordComplexityRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

    if (!passwordComplexityRegex.test(newPassword)) {
      setMessage(
        "パスワードは8文字以上で、英字・数字・記号をそれぞれ1文字以上含めてください。",
      );
      return;
    }

    if (!token) {
      setMessage("無効なリセットリンクです。もう一度手続きを始めてください。");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(data.message + " ログイン画面からログインしてください。");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "パスワード変更に失敗しました。");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setMessage(
        "パスワード変更に失敗しました。リセットリンクが期限切れの可能性があります。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-4">
              エラー
            </h1>
            <p className="text-center text-slate-600 mb-6">
              無効なリセットリンクです。
            </p>
            <div className="text-center">
              <Link href="/admin/password/reset-request">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors">
                  パスワードリセットをやり直す
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
            新しいパスワードを設定
          </h1>
          <p className="text-center text-slate-600 mb-6">
            新しいパスワードを入力してください。
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-md border ${
                isSuccess
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  isSuccess ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  新しいパスワード <span className="text-rose-500">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="新しいパスワードを入力"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  パスワード（確認） <span className="text-rose-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="パスワードを再入力"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || DEMO_MODE}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-bold text-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "変更中..." : "パスワードを変更"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <Link href="/admin">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors">
                  ログイン画面へ
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense>
      <PasswordResetContent />
    </Suspense>
  );
}
