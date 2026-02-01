"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminButton from "@/components/ui/admin-button";
import Textbox from "@/components/ui/admin-textbox";
import "@/styles/admin/index.css";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.push("/admin/home");
    } else {
      setError(
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center login-main">
      <form
        onSubmit={handleSubmit}
        className="shadow-md rounded-xl w-2/7 m-auto py-8 flex flex-col login-form"
      >
        <h1 className="text-center">ログイン</h1>

        {error && (
          <div className="text-red-600 text-center mb-4 text-sm">{error}</div>
        )}

        <label className="block w-3/4 mx-auto text-left">メールアドレス</label>
        <div className="text-center mb-4">
          <Textbox
            name="email"
            placeholder="メールアドレスを入力してください"
            className=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        <label className="block w-3/4 mx-auto text-left">パスワード</label>
        <div className="text-center mb-2">
          <Textbox
            name="password"
            placeholder="パスワードを入力してください"
            className=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>

        <Link href="/admin/password/reset-request" className="text-center mb-2">
          パスワードを忘れた場合
        </Link>

        <div className="text-center">
          <AdminButton
            label={loading ? "ログイン中..." : "ログイン"}
            type="submit"
            className="login-button"
            disabled={loading}
          />
        </div>
      </form>
    </main>
  );
}
