"use client";

import React, { useEffect, useState } from "react";
// tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Textbox from '@/components/ui/admin-textbox';
import "@/styles/admin/register-notice.css"

/**
 * tiptap を使った簡易 WYSIWYG
 * - 太字 / 斜体 / 下線 / 文字色 をサポート
 * - 文字数カウント（テキスト部分）を表示
 * - フォーム送信用に hidden input に HTML を格納
 *
 * コメントは処理ごとに細かく記載しています。
 */

export default function Page() {

  // tiptap のエディタを初期化
    const editor = useEditor({
        immediatelyRender:false,
    // クライアント限定で動かす（"use client" 指定済み）
    extensions: [
      // 基本のノード/マークを提供
      StarterKit,
      // 下線マーク（StarterKit に含まれないため追加）
      Underline,
      // テキストスタイル（Color と併用）
      TextStyle,
      // 文字色（textStyle マークを利用するため types に設定）
      Color.configure({ types: ["textStyle"] }),
    ],
    // 初期コンテンツ（必要に応じて変更）
    content: "",
    // 自動フォーカスは optional（環境により外しても良い）
    autofocus: false,
  });

  // エディタの HTML を保持（フォーム送信用）
  const [html, setHtml] = useState<string>("");


  // 選択中の色（UI 表示用）
  const [activeColor, setActiveColor] = useState<string>("#000000");

  // エディタの更新イベントで HTML と残り文字数を同期
  useEffect(() => {
    if (!editor) return;

    const update = () => {
      // HTML を取得して state に入れる
      setHtml(editor.getHTML());
    };

    // 初回同期
    update();

    // 更新イベントに登録
    editor.on("update", update);

    // クリーンアップ（アンマウント時にイベントを外す）
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  // ツールバー操作：太字・斜体・下線・色変更
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();

  const applyColor = (color: string) => {
    // textStyle を使って色を設定
    editor?.chain().focus().setColor(color).run();
    setActiveColor(color);
  };

  // フォーム送信処理（ここはプロジェクトの action に差し替えて使ってください）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 送信前に最新 HTML を確実に取り出す
    const latestHtml = editor?.getHTML() ?? "";
    setHtml(latestHtml);

    // 実際の送信処理はここに書く（fetch / form action 等）
    console.log("送信するHTML:", latestHtml);
    alert("送信（デモ）: コンソールを確認してください");
    };
    
    // サムネイルのプレビューURLを保持
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // ファイル選択時にDataURLを作ってプレビューにセットする
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    };

  return (
    <main className="p-6">
      <form onSubmit={handleSubmit}>
              {/* サムネインポート */}
        <section className="thumbnail-container h-50">
            <div className="thumbnail-inner flex justify-center">
                <input
                    id="thumbnail"
                    type="file"
                    name="file"
                    className="thumbnail-btn"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {/* プレビュー画像を container 全体に表示 */}
                {thumbnailPreview && (
                <img src={thumbnailPreview} alt="thumbnail preview" className="thumbnail-preview" />
                )}
                <label htmlFor="thumbnail" className="thumbnail-label inline-block px-3 py-2 cursor-pointer">
                    サムネイルを選択
                </label>
                  </div>
        </section>
        {/* ツールバー */}
        <div className="flex items-center gap-2 mb-2">
          {/* 太字 */}
          <button
            type="button"
            onClick={toggleBold}
            className={`px-3 py-1 border rounded ${editor?.isActive("bold") ? "bg-gray-200" : ""}`}
            title="太字"
          >
            B
          </button>

          {/* 斜体 */}
          <button
            type="button"
            onClick={toggleItalic}
            className={`px-3 py-1 border rounded italic ${editor?.isActive("italic") ? "bg-gray-200" : ""}`}
            title="斜体"
          >
            I
          </button>

          {/* 下線（Underline 拡張を使用） */}
          <button
            type="button"
            onClick={toggleUnderline}
            className={`px-3 py-1 border rounded ${editor?.isActive("underline") ? "bg-gray-200" : ""}`}
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
              className={`w-8 h-8 rounded-full border ${activeColor === "#000000" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#000000" }}
            />
            <button
              type="button"
              onClick={() => applyColor("#ff0000")}
              aria-label="赤"
              className={`w-8 h-8 rounded-full border ${activeColor === "#ff0000" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#ff0000" }}
            />
            <button
              type="button"
              onClick={() => applyColor("#0000ff")}
              aria-label="青"
              className={`w-8 h-8 rounded-full border ${activeColor === "#0000ff" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#0000ff" }}
            />
          </div>
        </div>

        {/* エディタ本体 */}
        <div className="border rounded">
          <EditorContent editor={editor} className="p-3 min-h-[200px]" />
        </div>

        {/* フォーム送信用の hidden input */}
        <input type="hidden" name="content" value={html} />

        <div className="mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            送信（デモ）
          </button>
        </div>
      </form>
    </main>
  );
}
