"use client";

import Styles from "@/styles/app/poster.module.css";
import Image from "next/image";
import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CreateCompleteContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || "--------";

  const [showIdTooltip, setShowIdTooltip] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setShowIdTooltip(true);
    setTimeout(() => setShowIdTooltip(false), 1500);
  };

  return (
    <div className={`${Styles.posterContainer} py-10`}>
      <Image
        src="/app/checkbox-multiple-marked-circle-outline.png"
        alt="checkMark"
        width={80}
        height={80}
        className="mx-auto"
      />
      <p
        className={`text-2xl font-bold mb-10 text-center ${Styles.text24px} ${Styles.mainColor}`}
      >
        アカウント登録が
        <br />
        完了しました！
      </p>

      {/* ユーザーID */}
      <div className={`text-center py-6 ${Styles.userIdContainer}`}>
        <p className={`font-bold ${Styles.text16px} ${Styles.subColor}`}>
          あなたのユーザーID
        </p>
        <div className="relative inline-block items-center">
          <input
            readOnly
            value={userId}
            className={`font-bold align-middle ${Styles.userId}`}
          />
          <button
            onClick={() => copyToClipboard(userId)}
            className={`${Styles.copyButton} border rounded-full align-middle`}
          >
            <Image
              src="/app/content-copy.png"
              width={30}
              height={30}
              alt="copy"
            />
          </button>
          {showIdTooltip && (
            <div
              className={`absolute top-0 left-42 transform -translate-x-1/2 -translate-y-full mb-2 w-2/3 py-1 text-white text-sm rounded ${Styles.tooltip}`}
            >
              コピーしました！
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center mt-15 mb-8">
        <Image
          src="/app/create-complete-alert.png"
          alt="警告"
          width={45}
          height={40}
          className=""
        />
        <p className={`text-red-500 font-bold`}>
          アカウントに関する注意事項を
          <br />
          ご確認ください。
        </p>
      </div>

      <div
        className={`border-2 border-red-500 rounded-sm px-7 py-8 mt-3 mb-15 shadow-lg`}
      >
        <div>
          <p
            className="font-bold mt-0.5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            ログイン時に必須の情報です
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            ユーザーIDはログイン時に必要です。
          </p>
        </div>
        <div>
          <p
            className="font-bold mt-5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            紛失しないようにご注意ください
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            これを紛失してしまった場合、アカウントの復旧はできません。
            <br />
            スクリーンショットを撮るなどして、大切に保管してください。
          </p>
        </div>
      </div>

      <Link href="/poster/login" className="w-full block">
        <button className="w-full font-bold mt-5 mb-10 py-3 rounded-full bg-[#FF8C42] text-white hover:bg-[#F97316]">
          ログイン画面へ
        </button>
      </Link>
    </div>
  );
}

export default function CreateCompletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCompleteContent />
    </Suspense>
  );
}
