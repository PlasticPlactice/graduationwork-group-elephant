"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import "@/styles/admin/events.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import AdminButton from "@/components/ui/admin-button";
import { REVIEW_STATUS_LABELS } from "@/lib/constants/reviewStatus";
import { formatAddress } from "@/lib/formatAddress";

interface BookReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: number | null;
}

interface BookReviewDetail {
  id: number;
  book_title: string;
  nickname: string;
  age: number;
  address: string;
  sub_address?: string | null;
  evaluations_status: number;
  evaluations_count: number;
  review: string;
}

export default function BookReviewDetailModal({
  isOpen,
  onClose,
  reviewId,
}: BookReviewDetailModalProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [detail, setDetail] = useState<BookReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Tiptapエディタ
  const editor = useEditor({
    extensions: [
      // Avoid duplicate underline registrations
      StarterKit.configure({ underline: false }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
    ],
    content: "",
    autofocus: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!isOpen || !reviewId) {
      setDetail(null);
      setIsLoading(false);
      setMessage("");
      setIsSending(false);
      setIsSaving(false);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/reviews/${reviewId}`);
        if (!res.ok) throw new Error("Failed to fetch review detail");
        const data = (await res.json()) as BookReviewDetail;
        if (isMounted) {
          setDetail(data);
        }
      } catch (err) {
        console.error("Error fetching review detail:", err);
        if (isMounted) {
          setDetail(null);
          addToast({
            type: "error",
            message: "書評詳細の取得に失敗しました。",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [isOpen, reviewId]);

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(detail?.review ?? "");
  }, [editor, detail]);

  // ツールバー操作
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const applyColor = (color: string) =>
    editor?.chain().focus().setColor(color).run();

  const handlePreview = () => {
    if (!reviewId) return;
    router.push(`/admin/print-preview?reviewId=${reviewId}`);
  };

  const handleSendMessage = async () => {
    if (!reviewId) return;

    const trimmed = message.trim();
    if (!trimmed) {
      addToast({ type: "warning", message: "メッセージを入力してください。" });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewIds: [reviewId],
          message: trimmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        addToast({
          type: "error",
          message: data?.error ?? "メッセージ送信に失敗しました。",
        });
        return;
      }

      addToast({ type: "success", message: "メッセージを送信しました。" });
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      addToast({ type: "error", message: "メッセージ送信に失敗しました。" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveReview = async () => {
    if (!reviewId || !editor) return;

    const trimmedText = editor.getText().trim();
    if (!trimmedText) {
      addToast({ type: "error", message: "書評本文を入力してください。" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review: editor.getHTML(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        addToast({
          type: "error",
          message: data?.error ?? "更新に失敗しました。",
        });
        return;
      }

      addToast({ type: "success", message: "書評本文を保存しました。" });
      router.refresh();
      onClose();
    } catch (err) {
      console.error("Error updating review:", err);
      addToast({
        type: "error",
        message:
          "書評本文の更新中に通信エラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 review-modal flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-6">
          <h2 className="text-2xl font-bold">書評詳細・編集</h2>
          <button onClick={onClose} className="close-btn text-black">
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>
        <div className="flex">
          <section className="w-[71.4286%]">
            {isLoading && (
              <p className="px-3 py-2 text-sm text-gray-600">読み込み中...</p>
            )}
            {/* ツールバー */}
            <div className="flex items-center gap-2 design-container py-2 pl-3">
              {/* 太字 */}
              <button
                type="button"
                onClick={toggleBold}
                className={`border rounded font-bold design-btn ${editor?.isActive("bold") ? "bg-gray-200" : ""}`}
                title="太字"
              >
                B
              </button>

              {/* 斜体 */}
              <button
                type="button"
                onClick={toggleItalic}
                className={`border rounded italic design-btn ${editor?.isActive("italic") ? "bg-gray-200" : ""}`}
                title="斜体"
              >
                I
              </button>

              {/* 下線（Underline 拡張を使用） */}
              <button
                type="button"
                onClick={toggleUnderline}
                className={`border rounded underline design-btn ${editor?.isActive("underline") ? "bg-gray-200" : ""}`}
                title="下線"
              >
                U
              </button>

              {/* 文字色（黒・赤・青） */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => applyColor("#000000")}
                  aria-label="黒"
                  className={`w-8 h-8 rounded-full border color-btn ${editor?.isActive("textStyle", { color: "#000000" }) ? "ring-2 ring-gray-700" : ""}`}
                  style={{ backgroundColor: "#000000" }}
                >
                  黒
                </button>
                <button
                  type="button"
                  onClick={() => applyColor("#ff0000")}
                  aria-label="赤"
                  className={`w-8 h-8 rounded-full border color-btn ${editor?.isActive("textStyle", { color: "#ff0000" }) ? "ring-2 ring-gray-700" : ""}`}
                  style={{ backgroundColor: "#ff0000" }}
                >
                  赤
                </button>
                <button
                  type="button"
                  onClick={() => applyColor("#0000ff")}
                  aria-label="青"
                  className={`w-8 h-8 rounded-full border color-btn ${editor?.isActive("textStyle", { color: "#0000ff" }) ? "ring-2 ring-gray-700" : ""}`}
                  style={{ backgroundColor: "#0000ff" }}
                >
                  青
                </button>
              </div>
            </div>

            {/* エディタ本体 */}
            <div className="editor-container">
              <EditorContent editor={editor} className="p-3 min-h-[200px]" />
            </div>
          </section>
          <section className="w-[28.5714%] pl-5">
            {/* 書籍名 */}
            <p className="font-bold text-center">
              「{detail?.book_title ?? "-"}」
            </p>
            <div className="text-xs">
              <div className="my-2 grid grid-cols-2">
                <p>名前</p>
                <p>{detail?.nickname ?? "-"}</p>
              </div>
              <div className="my-2 grid grid-cols-2">
                <p>年齢</p>
                <p>{detail?.age ?? "-"}</p>
              </div>
              <div className="my-2 grid grid-cols-2">
                <p>所在地</p>
                <p>{formatAddress(detail?.address, detail?.sub_address)}</p>
              </div>
              <div className="my-2 grid grid-cols-2">
                <p>ステータス</p>
                <p>
                  {detail
                    ? (REVIEW_STATUS_LABELS[detail.evaluations_status] ?? "-")
                    : "-"}
                </p>
              </div>
            </div>
            <textarea
              id="message-area"
              className="w-full"
              placeholder="投稿者へのメッセージを入力"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <AdminButton
              type="submit"
              className="w-full message-btn"
              label="メッセージ送信"
              onClick={handleSendMessage}
              disabled={isSending || !reviewId}
            />
            {/* 成功・失敗はトーストで表示するため、インラインメッセージは削除 */}
            <div className="flex justify-between items-center my-5">
              {/* いいね */}
              <div className="flex items-center gap-1">
                <Icon
                  icon={"mdi:heart-outline"}
                  width={40}
                  className="good-btn"
                />
                {/* ↓いいね数 */}
                <p className="good-num text-2xl">
                  {detail?.evaluations_count ?? 0}
                </p>
              </div>
              <div>
                <button className="preview-btn" onClick={handlePreview}>
                  <span className="font-lg">印刷プレビュー</span>
                </button>
              </div>
            </div>
            <AdminButton
              type="submit"
              className="w-full save-btn"
              label="確定して保存"
              onClick={handleSaveReview}
              disabled={isSaving || !reviewId || !editor}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
