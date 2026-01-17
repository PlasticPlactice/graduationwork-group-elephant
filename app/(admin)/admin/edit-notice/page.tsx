"use client";

import React, { useEffect, useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import "@/styles/admin/edit-notice.css"
import "@/styles/admin/notice-upload.css"
// tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";

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
  // キーボードから色を適用するハンドラ
  const handleColorKey = (e: React.KeyboardEvent<HTMLButtonElement>, color: string) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      applyColor(color);
    }
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

    // 添付ファイルのプレビュー情報（左から順に表示）
    type UploadPreview = { kind: "image"; src: string; name: string } | { kind: "file"; name: string };
    const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);

    // File -> DataURL のヘルパー
    const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

    // 添付ファイル選択ハンドラ（複数選択を想定、最大4件を表示）
    const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = "";
        if (!file) return;

    // 既存プレビューに追加（最大4件）
    const prev = uploadPreviews.slice();
    if (file.type.startsWith("image/")) {
        const src = await fileToDataURL(file);
        prev.push({ kind: "image", src, name: file.name });
    } else {
        prev.push({ kind: "file", name: file.name });
    }
    setUploadPreviews(prev.slice(0, 4));
  };
  
  // 指定インデックスのプレビューを削除する（UIからの削除）
    const removeUploadPreview = (index: number) => {
      setUploadPreviews(prev => prev.filter((_, i) => i !== index));
    };
    
  // モーダル制御
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const openPreview = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  // Esc で閉じる
  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex]);
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
                    required
                    onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) {
                            return;
                        }
                        const maxSize = 10 * 1024 * 1024; // 5MB
                        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                        if (!allowedTypes.includes(file.type)) {
                            alert("画像ファイル（JPEG / PNG / GIF / WebP）のみアップロードできます。");
                            e.target.value = "";
                            return;
                        }
                        if (file.size > maxSize) {
                            alert("ファイルサイズが大きすぎます。10MB以下の画像を選択してください。");
                            e.target.value = "";
                            return;
                        }
                        handleFileChange(e);
                    }}

                />
                {/* プレビュー画像を container 全体に表示 */}
                {thumbnailPreview && (
                <img src={thumbnailPreview} alt="thumbnail preview" className="thumbnail-preview"/>
                )}
                <label htmlFor="thumbnail" className="thumbnail-label inline-block px-3 py-2 cursor-pointer">
                    サムネイルを選択
                </label>
            </div>
        </section>
        <Textbox
            type="text"
            className="title w-full my-5"
            placeholder="タイトル"
            value="第2回文庫X開始!!"
            required
        />
        <div className="flex justify-between items-center mb-5">
            <div className="flex gap-10">
                <div className="flex items-center">
                    <input
                        type="radio"
                        className="notice-radio"
                        name="notice-type"
                        id="notice"
                        value="notice"
                        defaultChecked
                    />
                    <label htmlFor="notice" className="radio-label">お知らせ</label>
                </div>          
                <div className="flex items-center">
                    <input
                        type="radio"
                        className="notice-radio"
                        name="notice-type"
                        id="donation"
                        value="donation"
                    />
                    <label htmlFor="donation" className="radio-label">寄贈</label>
                </div>
            </div> 
               
            <div className="flex items-center gap-4">
                <Textbox
                    type="datetime-local"
                    placeholder="公開開始"
                    name="public-start-datetime"
                    className="datetime-box"
                    required
                />          
                <p>	&minus;</p>
                <Textbox
                    type="datetime-local"
                    placeholder="公開終了"
                    name="public-end-datetime"
                />
            </div>
        </div>
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
              onKeyDown={(e) => handleColorKey(e, "#000000")}
              aria-label="黒"
              className={`w-8 h-8 rounded-full border color-btn ${activeColor === "#000000" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#000000" }}
            >
              黒
            </button>
            <button
              type="button"
              onClick={() => applyColor("#ff0000")}
              onKeyDown={(e) => handleColorKey(e, "#ff0000")}
              aria-label="赤"
              className={`w-8 h-8 rounded-full border color-btn ${activeColor === "#ff0000" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#ff0000" }}
            >赤
            </button>
            <button
              type="button"
              onClick={() => applyColor("#0000ff")}
              onKeyDown={(e) => handleColorKey(e, "#0000ff")}
              aria-label="青"
              className={`w-8 h-8 rounded-full border color-btn ${activeColor === "#0000ff" ? "ring-2 ring-gray-700" : ""}`}
              style={{ backgroundColor: "#0000ff" }}
            >青
            </button>
          </div>
        </div>

        {/* エディタ本体 */}
        <div className="editor-container">
          <EditorContent editor={editor} className="p-3 min-h-[200px]" required/>
        </div>
        
              {/* 添付画像・ファイル */}
        <label htmlFor="upload" className="block">添付画像・ファイル</label>
        <div className="flex items-center gap-10">
            <input
                id="upload"
                type="file"
                name="upload"
                className="upload-btn"
                onChange={handleUploadChange}
            />
            <label htmlFor="upload" className="upload-label inline-block h-fit px-3 py-2 cursor-pointer">
            添付する画像・ファイルを選択
            </label>
            
           <div className="flex gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                <div
                  className="upload-preview"
                  key={i}
                  onClick={() => { if (uploadPreviews[i]) openPreview(i); }}
                  role={uploadPreviews[i] ? "button" : undefined}
                  aria-label={uploadPreviews[i] ? `プレビュー ${i+1}` : undefined}
                  >
                    {uploadPreviews[i] ? (
                      <>
                      {uploadPreviews[i].kind === "image" ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={uploadPreviews[i].src}
                            alt={uploadPreviews[i].name}
                            className="w-full h-full object-cover"
                            // width={80}
                            // height={80}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-sm">
                          <span>{uploadPreviews[i].name}</span>
                        </div>
                        )}
                        <div className="">
                          <button
                            type="button"
                            aria-label="プレビューを削除"
                            className="remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeUploadPreview(i); }}
                          >
                            &times;
                          </button>
                      </div>
                    </>
                    ) : (
                    <div className="p-2 h-20 flex items-center justify-center text-sm text-black">
                        未選択
                    </div>
                    )}
                </div>
                ))}
            </div>
        </div>

        {/* フォーム送信用の hidden input */}
        <input type="hidden" name="content" value={html} />

        <div className="mt-4 flex justify-end gap-5">
            <button type="button" className="draft-btn">下書きとして保存</button>
            <input type="submit" className="submit-btn" value="登録" />
        </div>
      </form>

      {/* プレビューモーダル */}
      {modalIndex !== null && uploadPreviews[modalIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 preview-modal" onClick={closeModal}>
          <div className="bg-white rounded p-4 max-w-[100%] max-h-[100%] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-medium">プレビュー</h3>
              <button type="button" onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="mt-4">
              {uploadPreviews[modalIndex].kind === "image" ? (
                <img src={uploadPreviews[modalIndex].src} alt={uploadPreviews[modalIndex].name} className="max-w-full max-h-[80vh] object-contain" />
              ) : (
                <div className="p-4">
                  <p className="font-medium">ファイル名</p>
                  <p className="mt-2">{uploadPreviews[modalIndex].name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
