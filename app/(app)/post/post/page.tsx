"use client";

import Styles from "@/styles/app/poster.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import type { CSSProperties } from "react";
import { preparePostConfirm } from "./actions";
import { useActionState } from "react";
import { useToast } from "@/contexts/ToastContext";
// tiptapのimport
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";

interface ProfileData {
  nickName: string;
  address: string;
  addressDetail: string;
  age: number;
  gender: number;
  introduction: string;
}

export default function PostPage() {
  const router = useRouter();

  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  // HTML送信用
  const [html, setHtml] = useState("");
  // 本のデザイン選択の状態管理用
  const [bookColor, setBookColor] = useState("#FFFFFF");
  const [patternColor, setPatternColor] = useState("#FFFFFF");
  const [pattern, setPattern] = useState("dot");
  // 文字数管理用
  const maxLength = 500;
  const [remaining, setRemaining] = useState(maxLength);
  // ウィジウィグのボタン状態管理用
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [_state, formAction] = useActionState(preparePostConfirm, null);
  const { addToast } = useToast();
  const [bookData, setBookData] = useState({
    isbn: "",
    title: "",
    author: "",
    publishers: "",
    event_id: "",
  });
  // ユーザーデータ
  const [userData, setUserData] = useState<ProfileData | null>(null);

  // フォーム状態（useEffect内で使用されるため先に宣言）
  const [form, setForm] = useState<{
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
  }>({
    user_id: null,
    review: "",
    color: "#FFFFFF",
    pattern: "dot",
    pattern_color: "#FFFFFF",
    isbn: "",
    book_title: "",
    evaluations_status: 0,
    nickname: "",
    address: "",
    age: 1,
    gender: 1,
    self_introduction: "",
    author: "",
    publishers: "",
    event_id: "",
    draft_flag: false,
    public_flag: true,
  });

  // 色選択用の配列
  const colors = [
    { name: "ホワイト", value: "#FFFFFF" },
    { name: "イエロー", value: "#FCD34D" },
    { name: "オレンジ", value: "#FF8C42" },
    { name: "ライムグリーン", value: "#BEF264" },
    { name: "グリーン", value: "#34D399" },
    { name: "シアン", value: "#67E8F9" },
    { name: "ピンク", value: "#F9A8D4" },
    { name: "パープル", value: "#A78BFA" },
    { name: "コーラル", value: "#FB7185" },
    { name: "スカイブルー", value: "#93C5FD" },
    { name: "ブルー", value: "#3B82F6" },
    { name: "ブラック", value: "#1F2937" },
  ];

  const patterns = [
    { name: "ドット", value: "dot", bg: "/app/bubble-pattern.png" },
    { name: "ストライプ", value: "stripe", bg: "/app/stripe-pattern.png" },
    { name: "チェック", value: "check", bg: "/app/check-pattern.png" },
    { name: "模様なし", value: "none", bg: "/app/stop-pattern.png" },
  ];

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // 確認画面から戻ってきた場合、保存されていたデータを復元
    const savedReviewData = sessionStorage.getItem("bookReviewDraft");
    if (savedReviewData) {
      try {
        const reviewData = JSON.parse(savedReviewData);
        console.log("Restoring review data from sessionStorage:", reviewData);

        // フォームデータを復元
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setForm({
          user_id: reviewData.user_id,
          review: reviewData.review || "",
          color: reviewData.color || "#FFFFFF",
          pattern: reviewData.pattern || "dot",
          pattern_color: reviewData.pattern_color || "#FFFFFF",
          isbn: reviewData.isbn || "",
          book_title: reviewData.book_title || "",
          evaluations_status: reviewData.evaluations_status || 0,
          nickname: reviewData.nickname || "",
          address: reviewData.address || "",
          age: reviewData.age || 1,
          gender: reviewData.gender || 1,
          self_introduction: reviewData.self_introduction || "",
          author: reviewData.author || "",
          publishers: reviewData.publishers || "",
          event_id: reviewData.event_id || "",
          draft_flag: reviewData.draft_flag || false,
          public_flag:
            reviewData.public_flag !== undefined
              ? reviewData.public_flag
              : true,
        });

        // 本情報を復元
        setBookData({
          isbn: reviewData.isbn || "",
          title: reviewData.book_title || "",
          author: reviewData.author || "",
          publishers: reviewData.publishers || "",
          event_id: reviewData.event_id || "",
        });

        // 色・パターン情報を復元
        setBookColor(reviewData.color || "#FFFFFF");
        setPattern(reviewData.pattern || "dot");
        setPatternColor(reviewData.pattern_color || "#FFFFFF");

        return;
      } catch (error) {
        console.error("Failed to restore review data:", error);
      }
    }

    // 本の情報がある場合は復元
    const draft = sessionStorage.getItem("bookItemDraft");

    if (!draft) return;

    const bookDataDraft = JSON.parse(draft);

    console.log(JSON.stringify(bookDataDraft, null, 2));

    fetchUserData();

    setBookData({
      isbn: bookDataDraft.isbn,
      title: bookDataDraft.title,
      author: bookDataDraft.author,
      publishers: bookDataDraft.publishers,
      event_id: bookDataDraft.eventId,
    });
  }, [fetchUserData]);

  // 書評確認画面へデータを送る
  const handleConfirm = () => {
    if (!editor) {
      alert("エディターが初期化されていません。");
      return;
    }

    // エディターの現在のHTMLを取得
    const currentHtml = editor.getHTML();

    // review フィールドとその他の必須フィールドを検証
    if (!currentHtml || currentHtml.trim() === "<p></p>") {
      alert("書評を入力してください。");
      return;
    }

    if (!form.isbn) {
      alert("本の情報が不足しています。");
      return;
    }

    if (
      !form.nickname ||
      !form.address ||
      !form.age ||
      !form.gender ||
      !form.self_introduction
    ) {
      alert("プロフィール情報が不完全です。");
      return;
    }

    const submitData = {
      ...form,
      review: currentHtml,
      evaluations_status: 0,
      mode: "create",
    };

    console.log(
      "[Post Confirm] Submitting data:",
      JSON.stringify(submitData, null, 2),
    );

    sessionStorage.setItem("bookReviewDraft", JSON.stringify(submitData));
    router.push("/post/post-confirm");
  };

  // 下書き登録用
  const registerBookReviewDraft = async (payload: typeof form) => {
    try {
      const res = await fetch("/api/book-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          review: editor?.getHTML() || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[Draft Register] API Error:", errorData);
        addToast({
          type: "error",
          message: `下書き保存に失敗しました。${errorData.message || ""}`,
        });
        return;
      }

      addToast({ type: "success", message: "下書きを保存しました" });
      router.push("/poster/mypage");
    } catch (e) {
      console.error("[Draft Register] Error:", e);
      addToast({ type: "error", message: "通信に失敗しました。" });
    }
  };

  // 下書きボタン押したときの処理
  const handleDraftConfirm = () => {
    const nextForm = {
      ...form,
      draft_flag: true,
    };

    setForm(nextForm);

    registerBookReviewDraft({
      ...nextForm,
    });
    router.push("/poster/mypage");
  };

  // tiptapに関する関数
  const bubbleRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      BubbleMenu.configure({
        element:
          typeof document !== "undefined"
            ? (document.querySelector(".bubble-menu") as HTMLElement | null)
            : null,
      }),
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: form.review,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const used = editor.storage.characterCount.characters();

      setHtml(html);
      setRemaining(maxLength - used);

      setForm((prev) => ({
        ...prev,
        color: bookColor,
        pattern: pattern,
        pattern_color: patternColor,
        review: editor.getHTML(),
      }));
    },
  });

  // boldボタンの状態管理
  const toggleBoldButton = () => {
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
    setBoldActive((prev) => !prev);
  };
  // italicボタンの状態管理
  const toggleItalicButton = () => {
    if (!editor) return;
    editor.chain().focus().toggleItalic().run();
    setItalicActive((prev) => !prev);
  };
  // underlineボタンの状態管理
  const toggleUnderlineButton = () => {
    if (!editor) return;
    editor.chain().focus().toggleUnderline().run();
    setUnderlineActive((prev) => !prev);
  };
  const handleSubmit = () => {
    if (!editor) return;
    setHtml(editor.getHTML());
  };

  useEffect(() => {
    if (bookData.publishers) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setForm((prev) => ({
        ...prev,
        publishers: bookData.publishers,
      }));
    }
    if (bookData.author) {
      setForm((prev) => ({
        ...prev,
        author: bookData.author,
      }));
    }
  }, [bookData]);

  useEffect(() => {
    if (!userId || !userData) return;

    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setForm((prev) => ({
      ...prev,
      user_id: Number(userId),
      event_id: bookData.event_id,
      isbn: bookData.isbn,
      book_title: bookData.title,
      nickname: userData.nickName,
      address: userData.address,
      age: userData.age,
      self_introduction: userData.introduction,
    }));
  }, [userId, userData, bookData]);

  // SSR対策で element を後付けする
  useEffect(() => {
    if (!editor || !bubbleRef.current) return;
    const plugin = editor.extensionManager.extensions.find(
      (ext) => ext.name === "bubbleMenu",
    );
    if (plugin) {
      plugin.options.element = bubbleRef.current;
    }
  }, [editor]);

  // エディターのコンテンツを復元
  useEffect(() => {
    if (!editor || !form.review) return;

    // フォームの review が更新されていて、エディターが異なる場合のみ更新
    const currentContent = editor.getHTML();
    if (currentContent !== form.review && form.review.trim() !== "") {
      console.log(
        "Restoring editor content:",
        form.review.substring(0, 50) + "...",
      );
      editor.commands.setContent(form.review);
    }
  }, [editor, form.review]);

  return (
    <div
      className={`${Styles.posterContainer}`}
      style={{ "--color-main": "#36A8B1" } as CSSProperties}
    >
      <p className={`font-bold text-center my-9 ${Styles.text24px}`}>
        あなただけの書評を書く
      </p>

      <div className="py-2 flex items-center justify-between border-t">
        <p className={`${Styles.subColor}`}>タイトル</p>
        <p className={`w-2/3`}>{bookData.title}</p>
      </div>
      <div className="py-2 flex items-center justify-between border-t border-b">
        <p className={`${Styles.subColor}`}>著者</p>
        <p className={`w-2/3`}>{bookData.author}</p>
      </div>

      <div className={`mt-6`}>
        <p className={`font-bold text-center`}>書評本文</p>

        <div className={`my-2`}>
          <p className={``}>
            残り
            <span className={`font-bold text-xl ${Styles.mainColor}`}>
              {Math.max(remaining, 0)}
            </span>
            文字
          </p>
        </div>

        <form action={formAction} onSubmit={handleSubmit}>
          <input type="hidden" name="content" value={html} />
          <div>
            {/* toolbar（DOMそのもの） */}
            <div
              className={`toolbar ${Styles.toolBar}`}
              style={{
                background: "white",
                padding: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                gap: "8px",
              }}
            >
              <div className="flex gap-4 justify-evenly">
                <div>
                  <p>文字の装飾</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={toggleBoldButton}
                      className={`${boldActive ? Styles.activeButton : Styles.inactiveButton} ${Styles.editorButton}`}
                    >
                      <span className="text-lg">B</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleItalicButton}
                      className={`${italicActive ? Styles.activeButton : Styles.inactiveButton} ${Styles.editorButton}`}
                    >
                      <span className="italic font-bold">I</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleUnderlineButton}
                      className={`${underlineActive ? Styles.activeButton : Styles.inactiveButton} ${Styles.editorButton}`}
                    >
                      <span className="underline decoration-2">U</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p>文字色</p>
                  <div className="w-20 items-center">
                    <input
                      type="color"
                      onChange={(e) =>
                        editor?.chain().focus().setColor(e.target.value).run()
                      }
                      className={`w-full h-8 rounded border cursor-pointer ${Styles.ColorPicker}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <EditorContent
              editor={editor}
              className={`border mt-4 rounded-sm px-0.5`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1 mt-6">
              <div className="border-t-2 w-1/2"></div>
              <p className="font-bold w-full text-center">デザインを選ぶ</p>
              <div className="border-t-2 w-1/2"></div>
            </div>
            <p className={`text-center my-3 ${Styles.subColor}`}>
              本の色や模様をあなた好みに変更しましょう。
            </p>
            <div className="mb-5">
              <p className="font-bold">本の色</p>
              <div className="my-2">
                <div
                  className={`grid grid-cols-6 gap-3 justify-between`}
                  id="color-select"
                >
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setBookColor(color.value);
                        setForm((prev) => ({
                          ...prev,
                          color: color.value,
                        }));
                      }}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                      className={`relative w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 ${Styles.colorButton}`}
                    >
                      {bookColor === color.value && (
                        <div
                          className="absolute inset-0 rounded-full border-4 border-white shadow-lg"
                          style={{ boxShadow: "0 0 0 2px var(--color-main)" }}
                        ></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="font-bold mt-4">本の模様</p>
            <div className={`grid grid-cols-4 gap-3 justify-between mb-4`}>
              {patterns.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setPattern(item.value);
                    setForm((prev) => ({
                      ...prev,
                      pattern: item.value,
                    }));
                  }}
                  style={{
                    backgroundImage: `url(${item.bg})`,
                    backgroundSize: "cover",
                    width: "72px",
                    height: "72px",
                    backgroundColor: "#FFFFFF",
                  }}
                  className={`relative mb-4 px-4 py-2 rounded-sm border`}
                >
                  {pattern === item.value && (
                    <div
                      className={`absolute inset-0.5 rounded-sm border-4 border-white shadow-lg ${Styles.patternButton}`}
                      style={{ boxShadow: "0 0 0 4px var(--color-main)" }}
                    ></div>
                  )}
                </button>
              ))}
            </div>
            <div>
              <p className="font-bold">模様の色</p>
              <div className="my-2">
                <div
                  className={`grid grid-cols-6 gap-3 justify-between`}
                  id="color-select"
                >
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setPatternColor(color.value);
                        setForm((prev) => ({
                          ...prev,
                          pattern_color: color.value,
                        }));
                      }}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                      className={`relative w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 ${Styles.colorButton}`}
                    >
                      {patternColor === color.value && (
                        <div
                          className="absolute inset-0 rounded-full border-4 border-white shadow-lg"
                          style={{ boxShadow: "0 0 0 2px var(--color-main)" }}
                        ></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            className={`w-full mt-10 font-bold ${Styles.barcodeScan__backButton}`}
            onClick={handleDraftConfirm}
          >
            下書きとして保存
          </button>

          <p className={`mt-1 mb-3 ${Styles.mainColor} ${Styles.text12px}`}>
            下書きはマイページから確認することができます。
          </p>
          <button
            type="submit"
            onClick={handleConfirm}
            className="w-full mt-1 font-bold"
          >
            確認画面へ
          </button>
        </form>
      </div>
    </div>
  );
}
