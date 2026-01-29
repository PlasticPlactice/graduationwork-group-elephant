"use client";

import loginModule from "@/styles/app/login.module.css";
import Styles from "@/styles/app/poster.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!accountId || !password) {
      setError("アカウントIDとパスワードを入力してください");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("user", {
        account_id: accountId,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        router.push("/poster/mypage");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("ログイン処理中にエラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link href="/" className={`block mt-7 ml-3 font-bold ${Styles.subColor}`}>
        <span>&lt;</span> ファンサイトはこちら
      </Link>
      <div className={`mb-2 ${Styles.posterContainer}`}>
        <div className="my-8">
          <Image
            src="/layout/logo.png"
            alt="logo"
            width={177}
            height={120}
            className="mx-auto"
          />
          <h1 className="font-bold text-center">ログイン</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-rose-100 border border-rose-500 text-rose-700 rounded">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="accountId"
              className={`font-bold ml-0.5 ${Styles.text16px}`}
            >
              ID
            </label>
            <div className="relative">
              <Image
                src="/app/loginForm-account.png"
                alt="logo"
                width={35}
                height={35}
                className="absolute top-1.5 left-2"
              />
              <input
                type="text"
                name="accountId"
                id="accountId"
                placeholder="ユーザーIDを入力"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`w-full ${loginModule.loginForm}`}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="mb-24">
            <label
              htmlFor="password"
              className={`font-bold ml-0.5 ${Styles.text16px}`}
            >
              パスワード
            </label>
            <div className="relative">
              <Image
                src="/app/loginForm-lock.png"
                alt="passwordLogo"
                width={30}
                height={30}
                className="absolute top-2 left-2.5"
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${loginModule.loginForm}`}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
          </div>
          <button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
