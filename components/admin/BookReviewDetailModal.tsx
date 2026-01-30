"use client"
import { Icon } from "@iconify/react";
import "@/styles/admin/events.css"
import { EditorContent, useEditor } from "@tiptap/react";
import { useState,useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import AdminButton from "@/components/ui/admin-button";

interface BookReviewDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
}



export default function BookReviewDetailModal({ isOpen, onClose }: BookReviewDetailModalProps) {
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
 const [detailHtml, setDetailHtml] = useState<string>("");
// エディタのHTMLを同期
useEffect(() => {
    if (!editor) return;
    const update = () => setDetailHtml(editor.getHTML());
    update();
    editor.on("update", update);
    return () => {
    editor.off("update", update);
    editor?.destroy();
    };
}, [editor]);

// ツールバー操作
const toggleBold = () => editor?.chain().focus().toggleBold().run();
const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
const applyColor = (color: string) =>
    editor?.chain().focus().setColor(color).run();

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 review-modal flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-6">
                    <h2 className="text-2xl font-bold">書評詳細・編集</h2>
                    <button onClick={onClose} className="close-btn text-black">
                        <Icon icon="mdi:close" width={24} className='text-black'/>
                    </button>
                </div>
                <div className="flex">
                    <section className="w-5/7">
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
                    <section className="w-2/7 pl-5">
                        {/* 書籍名 */}
                        <p className="font-bold text-center">「コンビニ人間」</p>
                        <div className="text-xs">
                            <div className="my-2 grid grid-cols-2">
                                <p>名前</p>
                                <p>丸丸太郎</p>
                            </div>
                            <div className="my-2 grid grid-cols-2">
                                <p>年齢</p>
                                <p>30代</p>
                            </div>
                            <div className="my-2 grid grid-cols-2">
                                <p>所在地</p>
                                <p>東京都</p>
                            </div>
                            <div className="my-2 grid grid-cols-2">
                                <p>ステータス</p>
                                <p>1次審査通過</p>
                            </div>
                        </div>
                        <textarea
                            id="message-area"
                            className="w-full"
                            placeholder="投稿者へのメッセージを入力"
                        ></textarea>
                        <AdminButton
                            type="submit"
                            className="w-full message-btn"
                            label="メッセージ送信"
                        />
                        <div className="flex justify-between items-center my-5">
                            {/* いいね */}
                            <div className="flex items-center gap-1">
                                <Icon icon={"mdi:heart-outline"} width={40} className="good-btn" />
                                {/* ↓いいね数 */}
                                <p className="good-num text-2xl">100</p>
                            </div>
                            <div>
                                <button className="preview-btn">
                                    <span className="font-lg">
                                        印刷プレビュー
                                    </span>
                                </button>
                            </div>
                        </div>
                        <AdminButton
                            type="submit"
                            className="w-full save-btn"
                            label="確定して保存"
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}
