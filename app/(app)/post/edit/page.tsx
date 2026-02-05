"use client";

import Styles from "@/styles/app/poster.module.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
// tiptapのimport
import { EditorContent, parseIndentedBlocks, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import { preparePostConfirm } from "./actions";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { BookReviewDeleteConfirmModal } from "@/components/modals/BookReviewDeleteConfirmModal";

export default function PostPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  // HTML送信用
  const [html, setHtml] = useState("");
  // 文字数管理用
  const maxLength = 500;
  const [remaining, setRemaining] = useState(maxLength);
  // ウィジウィグのボタン状態管理用
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const [colorActive, setColorActive] = useState<string>("#000000");

  const [state, formAction] = useActionState(preparePostConfirm, null);
  const [bookReviewData, setBookReviewData] = useState<any>(null);
  const [isDraft, setIsDraft] = useState(false);

  const [form, setForm] = useState<{
    bookReview_id: number | null;
    review: string;
    color: string;
    pattern: string;
    pattern_color: string;
    evaluations_status: number;
  }>({
    bookReview_id: null,
    review: "",
    color: "#FFFFFF",
    pattern: "dot",
    pattern_color: "#FFFFFF",
    evaluations_status: 2,
  });
  const [draftForm, setDraftForm] = useState<{
    id: number | null;
    review: string;
    color: string;
    pattern: string;
    pattern_color: string;
    evaluations_status: number;
  }>({
    id: null,
    review: "",
    color: "#FFFFFF",
    pattern: "dot",
    pattern_color: "#FFFFFF",
    evaluations_status: 1,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 本のデザイン選択の状態管理用
  const [bookColor, setBookColor] = useState("#FFFFFF");
  const [patternColor, setPatternColor] = useState("#FFFFFF");
  const [pattern, setPattern] = useState("dot");

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
    { name: "dot", value: "dot", bg: "/app/bubble-pattern.png" },
    { name: "ストライプ", value: "stripe", bg: "/app/stripe-pattern.png" },
    { name: "チェック", value: "check", bg: "/app/check-pattern.png" },
    { name: "模様なし", value: "none", bg: "/app/stop-pattern.png" },
  ];

  // 指定したIDの書評データを取得
  const fetchBookReviewDataById = useCallback(async (bookReviewId: number) => {
    try {
      const res = await fetch(`/api/book-reviews/detail/${bookReviewId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookReviewData(data);
      }
    } catch (error) {
      console.error("Failed to Fetch book review detail data");
    }
  }, []);

  useEffect(() => {
    if (!bookReviewData) return;

    console.log("bookReviewData" + JSON.stringify(bookReviewData));

    if (bookReviewData.evaluations_status == 1) {
      setIsDraft(true);
    }

    setDraftForm((prev) => ({
      ...prev,
      id: bookReviewData.id,
      review: bookReviewData.review,
      color: bookReviewData.color,
      pattern: bookReviewData.pattern,
      pattern_color: bookReviewData.pattern_color,
    }));
  }, [bookReviewData]);

  // データ取得の実行
  useEffect(() => {
    const draft = sessionStorage.getItem("bookReviewIdDraft");

    if (!draft) return;

    const parsed = JSON.parse(draft);

    const bookReviewId =
      typeof parsed === "number" ? parsed : parsed.bookReviewId;

    fetchBookReviewDataById(bookReviewId);
  }, [fetchBookReviewDataById]);

  // 下書き登録用
  const registerBookReviewDraft = async (payload: typeof draftForm) => {
    try {
      const res = await fetch("/api/book-reviews/mypage/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("下書きの登録に失敗しました。");
        return;
      }

      router.push("/poster/mypage");
    } catch (e) {
      alert("通信に失敗しました。");
    }
  };

  // 下書きボタン押したときの処理
  const handleDraftConfirm = () => {
    const nextForm = {
      ...draftForm,
      evaluations_status: 1,
    };

    console.log("nextForm" + JSON.stringify(nextForm));

    setDraftForm(nextForm);

    registerBookReviewDraft({
      ...nextForm,
    });
    // router.push("/poster/mypage");
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
    content: "",
    onUpdate({ editor }) {
      setForm({
        ...form,
        review: editor.getHTML(),
        color: bookColor,
        pattern: pattern,
        pattern_color: patternColor,
      });
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

  // form送信時にHTMLをセット
  const handleSubmit = (e: React.FormEvent) => {
    if (!editor) return;
    setHtml(editor.getHTML());
  };

  // 書評データが取得できたら本のデザイン初期値をセット
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!bookReviewData) return;
    if (initializedRef.current) return;

    setBookColor(bookReviewData.color || "#FFFFFF");
    setPatternColor(bookReviewData.pattern_color || "#FFFFFF");
    setPattern(bookReviewData.pattern || "dot");

    initializedRef.current = true;
  }, [bookReviewData]);

  // エディタ内容が更新されたらHTMLをセット
  useEffect(() => {
    if (!editor) return;
    const updateHtml = () => {
      setHtml(editor.getHTML());
    };
    editor.on("update", updateHtml);
  }, [editor]);

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

  // 文字数カウントの更新
  useEffect(() => {
    if (!editor) return;
    const updateCount = () => {
      const used = editor.storage.characterCount.characters();
      setRemaining(maxLength - used);
    };
    // 初期化
    updateCount();
    // エディタ更新イベント
    editor.on("update", updateCount);
    // cleanup(メモリリーク防止)
    return () => {
      editor.off("update", updateCount);
    };
  }, [editor]);

  // 書評データが取得できたらエディタに内容をセット
  useEffect(() => {
    if (!editor || !bookReviewData) return;

    editor.commands.setContent(bookReviewData.review ?? "");
  }, [editor, bookReviewData]);

  const handleConfirm = () => {
    const draft = sessionStorage.setItem(
      "bookReviewDraft",
      JSON.stringify({
        mode: "edit",
        id: bookReviewData?.id,
        ...form,
      }),
    );
    router.push("/post/post-confirm");
  };

  return (
    <>
      <BookReviewDeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        bookReviewId={bookReviewData?.id}
      />
      <div className={`${Styles.posterContainer}`}>
        <p className={`font-bold text-center my-3 ${Styles.text24px}`}>
          書評を修正
        </p>
        <a href="" className={`block font-bold ${Styles.subColor}`}>
          <span>&lt;</span> マイページに戻る
        </a>

        <div className="py-2 flex items-center justify-between border-t">
          <p className={`${Styles.subColor}`}>本のタイトル</p>
          <p className={`w-2/3`}>{bookReviewData?.book_title}</p>
        </div>
        <div className="py-2 flex items-center justify-between border-t border-b">
          <p className={`${Styles.subColor}`}>著者</p>
          <p className={`w-2/3`}>{bookReviewData?.author}</p>
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
                    <div className="w-20 items-center">
                    <input 
                      type="color"
                      onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
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
              <p className={`text-center ${Styles.subColor}`}>
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
              type="submit"
              onClick={handleConfirm}
              className="w-full mt-7 font-bold"
            >
              確認画面へ
            </button>
            {isDraft == true && (
              <div>
                <button
                  onClick={handleDraftConfirm}
                  className={`w-full mt-7 font-bold ${Styles.barcodeScan__backButton}`}
                >
                  下書きとして保存
                </button>
                <p className={`mt-1 ${Styles.mainColor} ${Styles.text12px}`}>
                  下書きはマイページから確認することができます。
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className={`w-full mt-3 ${Styles.barcodeScan__backButton}`}
            >
              削除する
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
