"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEMO_MODE } from "@/lib/constants/demoMode";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/password/reset-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setMessage(
          data.message || "エラーが発生しました。もう一度お試しください。",
        );
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      setMessage("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin"
            className="text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            aria-label="ログインページへ戻る"
          >
            &lt; ログインに戻る
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
            パスワードリセット
          </h1>
          <p className="text-center text-slate-600 mb-6">
            ご登録のメールアドレスを入力すると、パスワードリセットリンクをお送りします。
          </p>

          {message && (
            <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-blue-800 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSendReset} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-800 mb-2"
              >
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="管理者用メールアドレスを入力"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading || DEMO_MODE}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-bold text-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "送信中..." : "リセットリンクを送信"}
              </button>
              <Link href="/admin" className="w-full">
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
          </form>
        </div>
      </div>
    </div>
  );
}
