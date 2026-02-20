"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { BookPattern } from "@/components/bookshelf/BookPattern";
import type { PatternType } from "@/components/bookshelf/bookData";
import { useToast } from "@/contexts/ToastContext";

import Styles from "@/styles/app/poster.module.css";

interface BookReviewData {
  user_id: number | null;
  review: string;
  color: string;
  pattern: string;
  pattern_color: string;
  isbn: string;
  book_title: string;
  evaluations_status: number | null;
  nickname: string;
  address: string;
  age: number;
  gender: number;
  self_introduction: string;
  author: string;
  publishers: string;
  event_id: string;
  draft_flag: boolean;
  public_flag: boolean;
  mode: "create" | "edit";
  draft_flg?: boolean;
}

const normalizePattern = (pattern: string): PatternType => {
  const value = (pattern ?? "").toLowerCase();
  if (value === "dot" || value === "a" || value === "dots") return "dot";
  if (value === "stripe" || value === "b" || value === "lines") return "stripe";
  if (value === "check" || value === "c") return "check";
  return "none";
};

export default function PostConfirmPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [data] = useState<BookReviewData | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("bookReviewDraft");
    if (!raw) {
      console.warn("No bookReviewDraft in sessionStorage");
      return null;
    }
    try {
      return JSON.parse(raw) as BookReviewData;
    } catch (error) {
      console.error("Failed to parse bookReviewDraft:", error);
      return null;
    }
  });

  const registerBookReview = async () => {
    try {
      // データの存在確認
      if (!data) {
        addToast({ type: "error", message: "書評データが見つかりません。" });
        return;
      }

      // 必須フィールドの検証
      const requiredFields = [
        "user_id",
        "isbn",
        "review",
        "book_title",
        "nickname",
        "address",
        "age",
        "gender",
        "self_introduction",
        "color",
        "pattern",
        "pattern_color",
        "evaluations_status",
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = (data as unknown as Record<string, unknown>)[field];
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      });

      if (missingFields.length > 0) {
        addToast({
          type: "error",
          message: `必須項目が不足しています: ${missingFields.join(", ")}`,
        });
        console.error("Missing fields:", missingFields);
        return;
      }

      console.log("[Register] Submitting data:", JSON.stringify(data, null, 2));

      const res = await fetch("/api/book-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[Register] API Error:", errorData);
        addToast({
          type: "error",
          message: `登録に失敗しました。${errorData.message || ""}`,
        });
        return;
      }

      sessionStorage.removeItem("bookReviewDraft");

      if (data.event_id) {
        sessionStorage.setItem("eventId", String(data.event_id));
      }

      // 公開フラグに応じたメッセージ
      if (!data.draft_flag && data.public_flag) {
        addToast({ type: "success", message: "投稿を公開しました" });
      } else if (data.draft_flag) {
        addToast({ type: "success", message: "下書きを作成しました" });
      } else {
        addToast({ type: "success", message: "投稿を作成しました" });
      }
      router.push("/post/post-complete");
    } catch (e) {
      console.error("[Register] Error:", e);
      addToast({ type: "error", message: "通信に失敗しました。" });
    }
  };

  // PUT処理関数
  const updateBookReview = async () => {
    try {
      if (!data) {
        addToast({ type: "error", message: "書評データが見つかりません。" });
        return;
      }

      // 受け取るフィールド名の違いに対応する (draft_flg or draft_flag)
      const isDraftStatus = data.draft_flg === true || data.draft_flag === true;
      console.log("isDraftStatus:", isDraftStatus);

      const res = await fetch(`/api/book-reviews/mypage/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        addToast({
          type: "error",
          message: "書評の編集に失敗しました。時間をおいて再度お試しください。",
        });
        return;
      }

      // 編集モードならマイページへ戻す（マイページから編集したときの遷移確実化）
      if (data.mode === "edit") {
        sessionStorage.removeItem("bookReviewDraft");
        addToast({ type: "success", message: "投稿を更新しました" });
        router.push("/poster/mypage");
        return;
      }

      // 下書き状態か？ 公開フラグに応じてメッセージを分ける
      if (isDraftStatus) {
        sessionStorage.removeItem("bookReviewDraft");
        addToast({ type: "success", message: "下書きを更新しました" });
        router.push("/poster/mypage");
      } else {
        // 公開/非公開の切替があれば明示的に通知
        if (data.public_flag) {
          addToast({ type: "success", message: "投稿を公開しました" });
        } else {
          addToast({ type: "success", message: "投稿を非公開にしました" });
        }
        if (data.event_id) {
          sessionStorage.setItem("eventId", String(data.event_id));
          router.push("/post/post-complete");
        } else {
          router.push("/poster/mypage");
        }
      }
    } catch (error) {
      console.error("Error editing book review:", error);
      addToast({ type: "error", message: "書評の編集に失敗しました。" });
    }
  };

  const handleSubmit = () => {
    if (!data) {
      addToast({ type: "error", message: "書評データが見つかりません。" });
      return;
    }

    if (data.mode === "create") {
      registerBookReview();
    } else {
      updateBookReview();
    }
  };

  const handleGoBack = () => {
    // データを保持したまま前のページに戻る
    if (data?.mode === "edit") {
      // 編集モード時は前の状態に戻す
      router.back();
    } else {
      // 作成モード時は /post/post に戻る
      router.push("/post/post");
    }
  };

  if (!data) return null;

  const previewPattern = normalizePattern(data.pattern);
  const previewColor = data.color || "#FFFFFF";
  const previewPatternColor = data.pattern_color || "#FFFFFF";

  return (
    <div
      className={`${Styles.posterContainer}`}
      style={{ "--color-main": "#36A8B1" } as CSSProperties}
    >
      <p className={`font-bold text-center my-4 ${Styles.text24px}`}>
        書評を確認
      </p>

      <div
        dangerouslySetInnerHTML={{ __html: data.review }}
        className={`w-full border rounded-sm px-0.5 py-2 break-words ${Styles.userIdContainer}`}
      ></div>

      <div>
        <p className={`font-bold mt-5`}>本の見た目</p>
        <div className="flex justify-evenly">
          <div>
            <p className={`text-center my-3 ${Styles.subColor}`}>選択前</p>
            <div className="w-[106px] h-[164px] border rounded-sm overflow-hidden">
              <BookPattern
                pattern={previewPattern}
                baseColor={previewColor}
                patternColor={previewPatternColor}
              />
            </div>
          </div>
          <div className={`border-r`}></div>
          <div className="">
            <p className={`text-center my-3 ${Styles.subColor}`}>本棚</p>
            <div className="w-[34px] h-[164px] border rounded-sm overflow-hidden">
              <BookPattern
                pattern={previewPattern}
                baseColor={previewColor}
                patternColor={previewPatternColor}
              />
            </div>
          </div>
        </div>

        <button type="button" className={`w-full mt-10`} onClick={handleSubmit}>
          登録
        </button>
        <button
          type="button"
          onClick={handleGoBack}
          className={`w-full mt-4 ${Styles.barcodeScan__backButton}`}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
