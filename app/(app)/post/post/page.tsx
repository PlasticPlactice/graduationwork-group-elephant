"use client";

import Styles from "@/styles/app/poster.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { preparePostConfirm } from "./actions";
import { useActionState } from "react";
// tiptapのimport
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import { parseAppSegmentConfig } from "next/dist/build/segment-config/app/app-segment-config";

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

  const { data: session, status } = useSession();
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
  const [colorActive, setColorActive] = useState<string>("#000000");

  const [state, formAction] = useActionState(preparePostConfirm, null);
  const [bookData, setBookData] = useState({
    isbn: "",
    title: "",
    author: "",
    publishers: "",
    event_id: ""
  });
  // ユーザーデータ
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [data, setData] = useState<any>(null);

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

  useEffect(() => {
    const draft = sessionStorage.getItem("bookItemDraft");

    if (!draft) return;

    const bookDataDraft = JSON.parse(draft);

    console.log(JSON.stringify(bookDataDraft, null, 2))

    fetchUserData();

    setBookData({
      isbn: bookDataDraft.isbn,
      title: bookDataDraft.title,
      author: bookDataDraft.author,
      publishers: bookDataDraft.publishers,
      event_id: bookDataDraft.eventId
    });
  }, []);

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
  }>({
    user_id: null,
    review: "",
    color: "#FFFFFF",
    pattern: "dot",
    pattern_color: "#FFFFFF",
    isbn: "",
    book_title: "",
    evaluations_status: 2,
    nickname: "",
    address: "",
    age: 1,
    gender: 1,
    self_introduction: "",
    author: "",
    publishers: "",
    event_id: ""
  });

  const handleConfirm = () => {
    setForm({
      ...form,
      evaluations_status: 2,
    })

    sessionStorage.setItem(
      "bookReviewDraft",
      JSON.stringify({
        mode: "create",
        ...form,
      }),
    );
    router.push("/post/post-confirm");
  };

  // 下書き登録用
  const registerBookReviewDraft = async (payload: typeof form) => {
    try {
      const res = await fetch("http://localhost:3000/api/book-reviews", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      if(!res.ok) {
        alert("登録に失敗しました。");
        return;
      }

      router.push("/poster/mypage");
    } catch(e) {
      alert("通信に失敗しました。")
    }
  }

  // 下書きボタン押したときの処理
  const handleDraftConfirm = () => {
    const nextForm = {
      ...form,
      evaluations_status: 1
    };

    setForm(nextForm);

    registerBookReviewDraft({
      ...nextForm,
    })
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

      setForm(prev => ({
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
  // colorボタンの状態管理
  const handleColorClick = (color: string) => {
    if (!editor) return;

    editor.chain().focus().setColor(color).run();
    setColorActive(color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!editor) return;
    setHtml(editor.getHTML());
  };

  useEffect(() => {
    if (bookData.publishers) {
      setForm((prev) => ({
        ...prev,
        publishers: bookData.publishers
      }))
    }
    if (bookData.author) {
      setForm((prev) => ({
        ...prev,
        author: bookData.author
      }))
    }
  }, [bookData.publishers, bookData.author])

  useEffect(() => {
    if (!userId || !userData) return;

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
  }, [userId, userData]);

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

  return (
    <div className={`${Styles.posterContainer}`}>
      <p className={`font-bold text-center my-5 ${Styles.text24px}`}>
        あなただけの書評を書く
      </p>
      <a href="" className={`block font-bold ${Styles.subColor}`}>
        <span>&lt;</span> マイページに戻る
      </a>

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
            <span className="text-red-400 font-bold text-xl">
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
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleColorClick("#000000")}
                      className={`${colorActive === "#000000" ? `${Styles.activeColorButton} ${Styles.blackButton}` : Styles.inactiveButton} ${Styles.editorColorButton}`}
                    >
                      黒
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColorClick("#FF0000")}
                      className={`${colorActive === "#FF0000" ? `${Styles.activeColorButton} ${Styles.redButton}` : Styles.inactiveButton} ${Styles.editorColorButton}`}
                    >
                      赤
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColorClick("#0000FF")}
                      className={`${colorActive === "#0000FF" ? `${Styles.activeColorButton} ${Styles.blueButton}` : Styles.inactiveButton} ${Styles.editorColorButton}`}
                    >
                      青
                    </button>
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
                        <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg ring-2 ring-red-400"></div>
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
                      className={`absolute inset-0.5 rounded-sm border-4 border-white shadow-lg ring-4 ring-red-400 ${Styles.patternButton}`}
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
                        <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg ring-2 ring-red-400"></div>
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
