"use client";

import Styles from '@/styles/app/poster.module.css';
import Image from 'next/image';
import React from 'react';
import { useRef } from 'react';
import Link from "next/link";

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

      <div className='flex gap-4 items-center justify-center mt-15 mb-8'>
        <Image
        src="/app/create-complete-alert.png"
        alt="警告"
        width={45}
        height={40}
        className=''
        />
        <p className={`text-red-500 font-bold`}>アカウントに関する注意事項を<br/>ご確認ください。</p>
      </div>

      <div className={`border-2 border-red-500 rounded-sm px-7 py-8 mt-3 mb-15 shadow-lg`}>
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
            このIDはログイン時に必要です。
          </p>
        </div>
        <div>
          <p
            className="font-bold mt-5"
            style={{ color: "#ff4d6d", fontSize: "18px" }}
          >
            ユーザーIDは重要な情報です。
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: "var(--color-sub)", fontSize: "14px" }}
          >
            スクリーンショットを撮るなどして、大切に保管してください。
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
            ユーザーIDを紛失してしまった場合、アカウントの復旧はできません。
          </p>
        </div>
      </div>

      <Link href="/poster/login" className="w-full block">
        <button className="w-full font-bold mt-5 mb-10">ログイン画面へ</button>
      </Link>
    </div>
  );
}
