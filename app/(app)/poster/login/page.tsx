"use client";

import loginModule from "@/styles/app/login.module.css";
import Styles from "@/styles/app/account-create.module.css";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <a href="" className={`block mt-7 ml-3 font-bold ${Styles.subColor}`}>
        <span>&lt;</span> ファンサイトはこちら
      </a>
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

        <form action="" method="post">
          <div className="mb-4">
            <label
              htmlFor="userId"
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
                name="userId"
                id="userId"
                placeholder="ユーザーIDを入力"
                className={`w-full ${loginModule.loginForm}`}
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
                className={`w-full ${loginModule.loginForm}`}
              />
            </div>
          </div>
        </form>

        <Link href="/poster/mypage" className={`w-full block text-center`}>
          <button className={`w-full`}>ログイン</button>
        </Link>
      </div>
    </div>
  );
}
