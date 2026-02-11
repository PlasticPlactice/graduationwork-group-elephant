"use client";

import React, { useEffect, useState, useRef } from "react";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/register-notice.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns"; // ISO形式の文字列をパースする
import Image from "next/image";

// 添付ファイルのプレビュー情報
type UploadPreview =
  | {
      kind: "image";
      src: string;
      name: string;
      file?: File;
      mimeType?: string;
    }
  | {
      kind: "file";
      name: string;
      file?: File;
      mimeType?: string;
      src?: string;
    };

export default function Page() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);

  // フォームフィールドのstate
  const [title, setTitle] = useState<string>("");
  const [notificationType, setNotificationType] = useState<
    "notice" | "donation"
  >("notice");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [publicDateStart, setPublicDateStart] = useState<string>("");
  const [publicDateEnd, setPublicDateEnd] = useState<string>("");

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

  // アップロードファイル関連
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedFilePreviews, setAttachedFilePreviews] = useState<
    UploadPreview[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

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

  useEffect(() => {
    if (errorMessage) {
      mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMessage]);

  // ツールバー操作
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const applyColor = (color: string) =>
    editor?.chain().focus().setColor(color).run();

  // ファイルをDataURLに変換するヘルパー
  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (error: ProgressEvent<FileReader>) =>
        reject(error.target?.error || new Error("Unknown file read error"));
      reader.readAsDataURL(file);
    });

  // サムネイルファイル選択ハンドラ
  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "画像ファイル（JPEG / PNG / GIF / WebP）のみアップロードできます。",
      );
      e.target.value = "";
      return;
    }
    if (file.size > maxSize) {
      alert("ファイルサイズが大きすぎます。10MB以下の画像を選択してください。");
      e.target.value = "";
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(await fileToDataURL(file));
  };

  // 添付ファイル選択ハンドラ
  const handleAttachedFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = ""; // 同じファイルを再度選択できるようにクリア

    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(
        "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。",
      );
      return;
    }

    // 最大4件まで
    if (attachedFiles.length >= 6) {
      alert("添付ファイルは最大6つまでです。");
      return;
    }

    setAttachedFiles((prev) => [...prev, file]);
    // プレビュー表示用
    if (file.type.startsWith("image/")) {
      setAttachedFilePreviews((prev) => [
        ...prev,
        {
          kind: "image",
          src: URL.createObjectURL(file),
          name: file.name,
          file,
          mimeType: file.type,
        },
      ]);
    } else {
      setAttachedFilePreviews((prev) => [
        ...prev,
        {
          kind: "file",
          name: file.name,
          file,
          mimeType: file.type,
          src:
            file.type === "application/pdf"
              ? URL.createObjectURL(file)
              : undefined,
        },
      ]);
    }
  };

  // 添付ファイルのプレビュー削除
  const removeAttachedFilePreview = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachedFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const isPdfPreview = (preview: UploadPreview) => {
    if (preview.kind !== "file") return false;
    const mime = preview.mimeType || preview.file?.type;
    const lowerName = preview.name?.toLowerCase?.() || "";
    return Boolean(
      (mime && mime.includes("pdf")) || lowerName.endsWith(".pdf"),
    );
  };

  // ファイルアップロード共通関数
  // サーバはアップロード後に { id, data_path } を返すため、それを受け取る
  const uploadFile = async (
    file: File,
  ): Promise<{ id: number; data_path: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `ファイルのアップロードに失敗しました: ${res.status}`,
        );
      }
      const uploadedFile = await res.json();
      return { id: uploadedFile.id, data_path: uploadedFile.data_path };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "ファイルのアップロード中に不明なエラーが発生しました。";
      setErrorMessage(
        `ファイルのアップロード中にエラーが発生しました: ${errorMessage}`,
      );
      return null;
    }
  };

  // フォーム送信処理
  const handleSubmit = async (
    e: React.SyntheticEvent,
    saveAsDraft: boolean,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress(0);

    // バリデーション: タイトル
    if (!title.trim() && !saveAsDraft) {
      setErrorMessage("タイトルを入力してください。");
      setIsLoading(false);
      return;
    }

    if (title.length > 100) {
      setErrorMessage("タイトルは100文字以内で入力してください。");
      setIsLoading(false);
      return;
    }

    // バリデーション: 詳細
    if (!editor?.getText().trim() && !saveAsDraft) {
      setErrorMessage("お知らせ詳細を入力してください。");
      setIsLoading(false);
      return;
    }

    // 公開開始日時のバリデーション
    if (!saveAsDraft && !publicDateStart) {
      setErrorMessage("公開開始日時を選択してください。");
      setIsLoading(false);
      return;
    }

    // 公開日時が当日以降かチェック (下書きでなければ)
    if (!saveAsDraft && publicDateStart) {
      const selectedDate = parseISO(publicDateStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 時刻を00:00:00にリセット

      if (selectedDate < today) {
        setErrorMessage("公開開始日時は本日以降の日付を選択してください。");
        setIsLoading(false);
        return;
      }
    }

    // 終了日時のバリデーション
    if (!saveAsDraft && publicDateEnd && publicDateStart) {
      const startDate = parseISO(publicDateStart);
      const endDate = parseISO(publicDateEnd);

      if (endDate <= startDate) {
        setErrorMessage(
          "公開終了日時は公開開始日時より後の日時を選択してください。",
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      // 1. ファイルアップロード
      const uploadedAttachmentIds: number[] = [];
      let uploadedThumbnailId: number | null = null;
      let uploadedThumbnailPath: string | null = null;
      const totalFiles = (thumbnailFile ? 1 : 0) + attachedFiles.length;
      let uploadedCount = 0;

      if (thumbnailFile) {
        setUploadProgress(Math.round(((uploadedCount / totalFiles) * 100) / 2)); // アップロード進捗は50%まで
        const result = await uploadFile(thumbnailFile);
        if (result !== null) {
          uploadedThumbnailId = result.id;
          uploadedThumbnailPath = result.data_path;
        }
        uploadedCount++;
      }

      for (const file of attachedFiles) {
        setUploadProgress(Math.round(((uploadedCount / totalFiles) * 100) / 2));
        const resFile = await uploadFile(file);
        if (resFile !== null) uploadedAttachmentIds.push(resFile.id);
        uploadedCount++;
      }

      setUploadProgress(50); // アップロード完了

      // 2. お知らせ作成API呼び出し
      setUploadProgress(75);
      const notificationTypeInt = notificationType === "notice" ? 0 : 1;
      const shouldPublish = !saveAsDraft && isPublic;
      // メイン画像は main_image_path で管理、添付ファイルのみを fileIds に含める
      const finalFileIds: number[] = [...uploadedAttachmentIds];

      const notificationData = {
        title: title,
        detail: detailHtml,
        public_flag: shouldPublish,
        public_date: saveAsDraft
          ? new Date().toISOString()
          : parseISO(publicDateStart).toISOString(), // 下書きの場合は現在時刻
        public_end_date: publicDateEnd
          ? parseISO(publicDateEnd).toISOString()
          : null,
        notification_type: notificationTypeInt,
        draft_flag: saveAsDraft,
        fileIds: finalFileIds,
        main_image_path: uploadedThumbnailPath ?? null,
      };

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `お知らせの登録に失敗しました: ${res.status}`,
        );
      }

      setUploadProgress(100);
      setSuccessMessage(
        saveAsDraft ? "下書きを保存しました。" : "お知らせを登録しました。",
      );

      // 2秒後にリダイレクト
      setTimeout(() => {
        router.push("/admin/notice");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "お知らせの登録中に不明なエラーが発生しました。";
      setErrorMessage(
        errorMessage || "お知らせの登録中にエラーが発生しました。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // モーダル制御（プレビュー）
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const openPreview = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);
  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex]);

  return (
    <main className="p-6" ref={mainRef}>
      <h1 className="text-2xl font-bold mb-6">お知らせ登録</h1>
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline ml-2">{errorMessage}</span>
          <button
            type="button"
            className="absolute top-0 right-0 px-4 py-3 hover:bg-red-200 rounded transition-colors"
            onClick={() => setErrorMessage("")}
            aria-label="閉じる"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">成功:</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}
      {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-blue-700">処理中...</span>
            <span className="text-sm font-medium text-blue-700">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* サムネイルインポート */}
        <section className="thumbnail-container" style={{ height: "200px" }}>
          <div
            className="thumbnail-inner flex justify-center relative"
            style={{ width: "100%", height: "100%" }}
          >
            <input
              id="register-thumbnail"
              type="file"
              name="thumbnailFile"
              className="thumbnail-btn"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview && (
              <Image
                src={thumbnailPreview}
                alt="thumbnail preview"
                className="thumbnail-preview"
                width={400}
                height={225}
                unoptimized
              />
            )}
            <label
              htmlFor="register-thumbnail"
              className="thumbnail-label inline-block px-3 py-2 cursor-pointer"
            >
              {thumbnailPreview ? "サムネイルを変更" : "サムネイルを選択"}
            </label>
          </div>
        </section>

        <label htmlFor="title" className="block mt-5 mb-1">
          タイトル<span className="required">*</span>
        </label>
        <Textbox
          type="text"
          className="title w-full mb-5"
          placeholder="タイトル"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-10 items-center">
            <div className="flex items-center">
              <input
                type="radio"
                className="notice-radio"
                name="notification-type"
                id="register-notice-type"
                value="notice"
                checked={notificationType === "notice"}
                onChange={() => setNotificationType("notice")}
              />
              <label htmlFor="register-notice-type" className="radio-label">
                お知らせ
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                className="notice-radio"
                name="notification-type"
                id="register-donation-type"
                value="donation"
                checked={notificationType === "donation"}
                onChange={() => setNotificationType("donation")}
              />
              <label htmlFor="register-donation-type" className="radio-label">
                寄贈
              </label>
            </div>

            <div className="flex items-center gap-6 ml-8">
              <div className="flex items-center">
                <input
                  type="radio"
                  className="notice-radio"
                  name="publish-status"
                  id="register-publish"
                  value="public"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <label htmlFor="register-publish" className="radio-label">
                  公開
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  className="notice-radio"
                  name="publish-status"
                  id="register-private"
                  value="private"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                <label htmlFor="register-private" className="radio-label">
                  非公開
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-38">
              公開期間<span className="required">*</span>
            </label>
            <Textbox
              type="datetime-local"
              placeholder="公開開始"
              name="public-start-datetime"
              className="datetime-box"
              required
              value={publicDateStart}
              onChange={(e) => setPublicDateStart(e.target.value)}
            />
            <p>&minus;</p>
            <Textbox
              type="datetime-local"
              placeholder="公開終了"
              name="public-end-datetime"
              className="datetime-box"
              value={publicDateEnd}
              onChange={(e) => setPublicDateEnd(e.target.value)}
            />
          </div>
        </div>
        {/* ツールバー */}
        <label htmlFor="title" className="block mt-5 mb-1">
          本文<span className="required">*</span>
        </label>
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

        {/* 添付画像・ファイル */}
        <label htmlFor="register-upload" className="block mt-4">
          添付画像・ファイル
        </label>
        <div className="flex items-center gap-10">
          <input
            id="register-upload"
            type="file"
            name="attachedFile"
            className="upload-btn"
            onChange={handleAttachedFileChange}
            multiple={false} // 複数選択を許可しない
          />
          <label
            htmlFor="register-upload"
            className="upload-label inline-block h-fit px-3 py-2 cursor-pointer"
          >
            添付する画像・ファイルを選択
          </label>

          <div className="flex gap-5">
            {attachedFilePreviews.map((preview, i) => (
              <div
                className="upload-preview relative w-20 h-20"
                key={i}
                onClick={() => openPreview(i)}
                role="button"
                aria-label={`プレビュー ${i + 1}`}
                style={{
                  backgroundColor: "transparent",
                  border: "2px dashed #000000",
                }}
              >
                {preview.kind === "image" ? (
                  <Image
                    src={preview.src}
                    alt={preview.name}
                    className="w-full h-full object-cover rounded"
                    width={120}
                    height={120}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center text-xs p-2 break-words w-full h-full rounded">
                    <span className="truncate">{preview.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label="プレビューを削除"
                  className="absolute -top-2 -right-2 rounded w-6 h-6 flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    color: "#000000",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttachedFilePreview(i);
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
            {Array.from({ length: 6 - attachedFilePreviews.length }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="upload-preview w-20 h-20 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-300 rounded"
                >
                  未選択
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-5">
          <AdminButton
            type="button"
            className="draft-btn"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            label={isLoading ? "保存中..." : "下書きとして保存"}
          />
          <AdminButton
            type="submit"
            className="submit-btn"
            disabled={isLoading}
            label={isLoading ? "登録中..." : "登録"}
          />
        </div>
      </form>

      {/* プレビューモーダル */}
      {modalIndex !== null && attachedFilePreviews[modalIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 preview-modal"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded p-4 max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-medium">プレビュー</h3>
              <button
                type="button"
                onClick={closeModal}
                className="close-btn text-2xl px-2 hover:bg-gray-100 rounded"
              >
                &times;
              </button>
            </div>
            <div className="mt-4">
              {attachedFilePreviews[modalIndex].kind === "image" ? (
                <div className="relative w-full" style={{ maxHeight: "70vh" }}>
                  <Image
                    src={attachedFilePreviews[modalIndex].src}
                    alt={attachedFilePreviews[modalIndex].name}
                    className="object-contain"
                    width={1200}
                    height={900}
                    unoptimized
                    style={{
                      maxHeight: "70vh",
                      width: "auto",
                      height: "auto",
                    }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  {isPdfPreview(attachedFilePreviews[modalIndex]) &&
                  attachedFilePreviews[modalIndex].src ? (
                    <object
                      data={attachedFilePreviews[modalIndex].src}
                      type="application/pdf"
                      className="w-full"
                      style={{ maxHeight: "70vh", minHeight: "60vh" }}
                    >
                      <p className="text-sm text-gray-600">
                        PDFプレビューを表示できません。以下からダウンロードしてください。
                      </p>
                    </object>
                  ) : null}
                  <p className="font-medium mt-4">ファイル名</p>
                  <p className="mt-2 break-words">
                    {attachedFilePreviews[modalIndex].name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
