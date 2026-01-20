"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Styles from "@/styles/app/poster.module.css";
import Image from "next/image";
import Link from "next/link";
import { POST } from "@/app/api/book-reviews/route";

export default function PostConfirmPage({
}: {
}) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log(sessionStorage.getItem("bookReviewDraft"))
    const draft = sessionStorage.getItem("bookReviewDraft");

    if(!draft) {
      router.push("/api/book-reviews/new");
      return;
    }
    setData(JSON.parse(draft));
  }, []);

  if (!data) return null;

  return (
    <div className={`${Styles.posterContainer}`}>
      <p className={`font-bold text-center my-4 ${Styles.text24px}`}>
        書評を確認
      </p>

      <div
        // formのデータ送信に必要？（今回はモックのため未使用）
        dangerouslySetInnerHTML={{ __html: data.review }}
        className={`w-full border rounded-sm px-0.5 py-2 ${Styles.userIdContainer}`}
      >
      </div>

      <div>
        <p className={`font-bold mt-5`}>本の見た目</p>
        <div className="flex justify-evenly">
          <div>
            <p className={`text-center my-3 ${Styles.subColor}`}>選択前</p>
            <Image
              src="/app/book-bubble.png"
              alt="水玉"
              width={106}
              height={164}
            />
          </div>
          <div className={`border-r`}></div>
          <div className="">
            <p className={`text-center my-3 ${Styles.subColor}`}>本棚</p>
            <Image
              src="/app/bubble-back.png"
              alt="水玉"
              width={34}
              height={164}
            />
          </div>
        </div>

        <button className={`w-full mt-10`} onClick={async () => {
          try {
            const res = await fetch("http://localhost:3000/api/book-reviews", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify(data),
            });

            if(!res.ok) {
              alert("登録に失敗しました。");
              return;
            }

            sessionStorage.removeItem("bookReviewDraft");
            router.push("/post/post-complete");
          } catch(e) {
            alert("通信に失敗しました。")
          }
        }}>
          登録
        </button>
        <Link href="post" className="w-full mt-4 block">
          <button className={`w-full ${Styles.barcodeScan__backButton}`}>
            戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
