"use client";
import Styles from "@/styles/app/account-create.module.css";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRef } from "react";

export default function CreateCompletePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTooltip, setshowTooltip] = React.useState(false);

  const copyToUserId = async () => {
    if (inputRef.current) {
      await navigator.clipboard.writeText(inputRef.current.value);
      setshowTooltip(true);
      setTimeout(() => setshowTooltip(false), 1500);
    }
  };

  return (
    <div className={`${Styles.posterContainer} py-10`}>
      <Image
        src="/layout/logo.png"
        alt="logo"
        width={177}
        height={120}
        className="mx-auto"
      />
      <p
        className={`text-2xl font-bold mt-6 mb-10 text-center ${Styles.text24px} ${Styles.mainColor}`}
      >
        アカウント登録が
        <br />
        完了しました！
      </p>

      <div className={`text-center py-6 ${Styles.userIdContainer}`}>
        <p className={`font-bold ${Styles.text16px} ${Styles.subColor}`}>
          あなたのユーザーID
        </p>
        <div className="relative inline-block items-center">
          <input
            id="userId"
            ref={inputRef}
            defaultValue={"0000000000"}
            className={`font-bold align-middle ${Styles.userId}`}
          />
          {/* コピペのボタン */}
          <button
            onClick={copyToUserId}
            className={`${Styles.copyButton} border rounded-full align-middle`}
          >
            <Image
              src="/app/content-copy.png"
              width={30}
              height={30}
              alt="copy"
            />
          </button>
          {showTooltip && (
            <div
              className={`absolute top-0 left-42 transform -translate-x-1/2 -translate-y-full mb-2 w-2/3 py-1 text-white text-sm rounded ${Styles.tooltip}`}
            >
              コピーしました！
            </div>
          )}
        </div>
      </div>

      <div className="flex mt-12 mb-14.5">
        <Image
          src="/app/login.png"
          width={48}
          height={48}
          alt="logo"
          className={`mr-4 p-1 ${Styles.alertImage}`}
        />
        <div>
          <p
            className="font-bold mt-0.5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            ※ ログイン時に必要です
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            このIDはログイン時に必要となります。
          </p>
        </div>
      </div>
      <div className="flex mt-9 mb-10">
        <Image
          src="/app/monitor-screenshot.png"
          width={48}
          height={48}
          alt="monitor"
          className={`mr-4 p-1 ${Styles.alertImage}`}
        />
        <div>
          <p
            className="font-bold mt-0.5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            ※ 大切に保管してください
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            スクリーンショットを撮るなどして、ご自身で大切に保管してください。
          </p>
        </div>
      </div>
      <div className="flex mt-9 mb-15">
        <Image
          src="/app/account-off.png"
          width={48}
          height={48}
          alt="logo"
          className={`mr-4 p-1 ${Styles.alertImage}`}
        />
        <div>
          <p
            className="font-bold mt-0.5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            ※ 紛失すると復旧できません
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            ユーザーIDを紛失した場合、アカウントの復旧はできませんのでご注意ください。
          </p>
        </div>
      </div>

      <Link href="/poster/login" className="w-full block">
        <button className="w-full">ログイン画面へ</button>
      </Link>
    </div>
  );
}
