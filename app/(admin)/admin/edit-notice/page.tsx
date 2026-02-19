"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/register-notice.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { parseISO, format } from "date-fns";
import Image from "next/image";

// 添付ファイルのプレビュー情報
type UploadPreview =
  | {
      kind: "image";
      src: string;
      name: string;
      file?: File;
      fileId?: number;
      mimeType?: string;
    }
  | {
      kind: "file";
      name: string;
      file?: File;
      fileId?: number;
      mimeType?: string;
      src?: string;
    };

// APIレスポンス用の簡易型
type RemoteNotificationFile = {
  file?: {
    id?: number;
    original_filename?: string;
    name?: string;
    data_path?: string;
    type?: string;
  };
};

function EditNoticeContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const searchParams = useSearchParams();
  const notificationIdParam = searchParams.get("id");
  const notificationIdRaw =
    Array.isArray(notificationIdParam) && notificationIdParam.length > 0
      ? notificationIdParam[0]
      : notificationIdParam;
  const notificationId =
    notificationIdRaw && !Number.isNaN(Number(notificationIdRaw))
      ? Number(notificationIdRaw)
      : null;

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
      // Explicitly disable underline inside StarterKit to avoid duplicate extension warnings
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
  const [existingMainImagePath, setExistingMainImagePath] = useState<
    string | null
  >(null);
  const [attachedFilePreviews, setAttachedFilePreviews] = useState<
    UploadPreview[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 初期データを取得
  useEffect(() => {
    if (notificationId === null) {
      addToast({ type: "error", message: "お知らせIDが正しくありません。" });
      return;
    }

    const fetchNotification = async () => {
      try {
        const res = await fetch(`/api/admin/notifications/${notificationId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`お知らせの取得に失敗しました: ${res.status}`);
        }

        const data = await res.json();

        // フォームに填入
        setTitle(data.title || "");
        setNotificationType(
          data.notification_type === 0 ? "notice" : "donation",
        );
        setIsPublic(Boolean(data.public_flag));

        if (data.public_date) {
          setPublicDateStart(
            format(parseISO(data.public_date), "yyyy-MM-dd'T'HH:mm"),
          );
        }

        if (data.public_end_date) {
          const formattedDate = format(
            parseISO(data.public_end_date),
            "yyyy-MM-dd'T'HH:mm",
          );
          if (formattedDate !== "9999-12-31T23:59") {
            setPublicDateEnd(formattedDate);
          }
        }

        if (data.detail) {
          setDetailHtml(data.detail);
          editor?.commands.setContent(data.detail);
        }

        // main_image_path を取得してサムネイルとして設定
        if (data.main_image_path) {
          setExistingMainImagePath(data.main_image_path);
          const path = data.main_image_path.startsWith("/")
            ? data.main_image_path
            : `/${data.main_image_path}`;
          setThumbnailPreview(path);
          // 注: メイン画像は notificationFiles には含まれないため、fileId は設定しない
        }

        // 添付ファイルを処理（notificationFiles にはメイン画像は含まれない）
        if (data.notificationFiles && data.notificationFiles.length > 0) {
          const previews: UploadPreview[] = data.notificationFiles.map(
            (nf: RemoteNotificationFile) => {
              const fileName =
                nf.file?.original_filename || nf.file?.name || "ファイル";
              const dataPath = nf.file?.data_path;
              const fullPath = dataPath?.startsWith("/")
                ? dataPath
                : `/${dataPath}`;
              const isImage =
                nf.file?.type?.startsWith("image/") ||
                fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

              if (isImage && fullPath) {
                return {
                  kind: "image" as const,
                  src: fullPath,
                  name: fileName,
                  file: undefined,
                  fileId: nf.file?.id,
                  mimeType: nf.file?.type,
                };
              } else {
                return {
                  kind: "file" as const,
                  name: fileName,
                  file: undefined,
                  fileId: nf.file?.id,
                  mimeType: nf.file?.type,
                  src: fullPath,
                };
              }
            },
          );
          setAttachedFilePreviews(previews);
        }
      } catch (error) {
        addToast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "お知らせの取得中にエラーが発生しました。",
        });
      }
    };

    fetchNotification();
  }, [notificationId, editor, addToast]);

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
      // ファイルが選択されない場合、既存のサムネイル（main image）に戻す
      if (existingMainImagePath) {
        setThumbnailFile(null);
        setThumbnailPreview(existingMainImagePath);
      } else {
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      addToast({
        type: "error",
        message:
          "画像ファイル（JPEG / PNG / GIF / WebP）のみアップロードできます。",
      });
      e.target.value = "";
      return;
    }
    if (file.size > maxSize) {
      addToast({
        type: "error",
        message:
          "ファイルサイズが大きすぎます。10MB以下の画像を選択してください。",
      });
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
    e.currentTarget.value = "";

    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addToast({
        type: "error",
        message:
          "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。",
      });
      return;
    }

    // 最大4件まで
    if (attachedFilePreviews.length >= 6) {
      addToast({ type: "error", message: "添付ファイルは最大6つまでです。" });
      return;
    }

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
      addToast({
        type: "success",
        message: `ファイルをアップロードしました: ${uploadedFile.data_path}`,
      });
      return { id: uploadedFile.id, data_path: uploadedFile.data_path };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "ファイルのアップロード中に不明なエラーが発生しました。";
      addToast({
        type: "error",
        message: `ファイルのアップロード中にエラーが発生しました: ${errorMessage}`,
      });
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
    setUploadProgress(0);

    if (notificationId === null) {
      addToast({ type: "error", message: "お知らせIDが正しくありません。" });
      setIsLoading(false);
      return;
    }

    // バリデーション: タイトル
    if (!title.trim() && !saveAsDraft) {
      addToast({ type: "error", message: "タイトルを入力してください。" });
      setIsLoading(false);
      return;
    }

    if (title.length > 100) {
      addToast({
        type: "error",
        message: "タイトルは100文字以内で入力してください。",
      });
      setIsLoading(false);
      return;
    }

    // バリデーション: 詳細
    if (!editor?.getText().trim() && !saveAsDraft) {
      addToast({ type: "error", message: "お知らせ詳細を入力してください。" });
      setIsLoading(false);
      return;
    }

    // 公開開始日時のバリデーション
    if (!saveAsDraft && !publicDateStart) {
      addToast({ type: "error", message: "公開開始日時を選択してください。" });
      setIsLoading(false);
      return;
    }

    // 終了日時のバリデーション
    if (!saveAsDraft && publicDateEnd && publicDateStart) {
      const startDate = parseISO(publicDateStart);
      const endDate = parseISO(publicDateEnd);

      if (endDate <= startDate) {
        addToast({
          type: "error",
          message: "公開終了日時は公開開始日時より後の日時を選択してください。",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      // 1. ファイルアップロード
      const filesNeedingUpload = attachedFilePreviews.filter(
        (preview) => preview.file,
      );
      const totalFiles = (thumbnailFile ? 1 : 0) + filesNeedingUpload.length;
      let _uploadedThumbnailPath: string | null = null;
      const uploadedAttachmentIds: number[] = [];
      let uploadedCount = 0;

      if (thumbnailFile) {
        if (totalFiles > 0) {
          setUploadProgress(
            Math.round(((uploadedCount / totalFiles) * 100) / 2),
          );
        }
        const result = await uploadFile(thumbnailFile);
        if (result !== null) {
          _uploadedThumbnailId = result.id;
          _uploadedThumbnailPath = result.data_path;
          setExistingMainImagePath(result.data_path);
        }
        uploadedCount++;
      } else if (existingMainImagePath) {
        // 既存のサムネイル（main image）を保持する場合、ここで処理
      }

      for (const preview of attachedFilePreviews) {
        if (!preview.file) continue; // 既存ファイルはこのループではスキップ
        if (totalFiles > 0) {
          setUploadProgress(
            Math.round(((uploadedCount / totalFiles) * 100) / 2),
          );
        }
        const result = await uploadFile(preview.file);
        if (result !== null) uploadedAttachmentIds.push(result.id);
        uploadedCount++;
      }

      setUploadProgress(totalFiles > 0 ? 50 : 0);

      // 既存ファイルIDを結合し、並び順を保った配列を作る
      const attachmentFileIds: number[] = [];
      let uploadIndex = 0;
      for (const preview of attachedFilePreviews) {
        if (preview.file && preview.fileId === undefined) {
          const nextId = uploadedAttachmentIds[uploadIndex];
          uploadIndex += 1;
          if (typeof nextId === "number") attachmentFileIds.push(nextId);
        } else if (typeof preview.fileId === "number") {
          attachmentFileIds.push(preview.fileId);
        }
      }

      // メイン画像は main_image_path で管理、添付ファイルのみを fileIds に含める
      const finalFileIds: number[] = [...attachmentFileIds];

      // 2. お知らせ更新API呼び出し
      setUploadProgress(75);
      const notificationTypeInt = notificationType === "notice" ? 0 : 1;
      const shouldPublish = !saveAsDraft && isPublic;
      const notificationData = {
        title: title,
        detail: detailHtml,
        public_flag: shouldPublish,
        public_date: saveAsDraft
          ? new Date().toISOString()
          : parseISO(publicDateStart).toISOString(),
        public_end_date: publicDateEnd
          ? parseISO(publicDateEnd).toISOString()
          : null,
        notification_type: notificationTypeInt,
        draft_flag: saveAsDraft,
        main_image_path: _uploadedThumbnailPath ?? existingMainImagePath,
        fileIds: finalFileIds,
      };

      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `お知らせの更新に失敗しました: ${res.status}`,
        );
      }

      setUploadProgress(100);
      addToast({ type: "success", message: "お知らせを更新しました。" });

      // 2秒後にリダイレクト
      setTimeout(() => {
        router.push("/admin/notice");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "お知らせの更新中に不明なエラーが発生しました。";
      addToast({
        type: "error",
        message: errorMessage || "お知らせの更新中にエラーが発生しました。",
      });
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
      <h1 className="text-2xl font-bold mb-6">お知らせ編集</h1>
      {/* 通知はトーストで表示します */}
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
              id="edit-thumbnail"
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
              htmlFor="edit-thumbnail"
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
                id="edit-notice-type"
                value="notice"
                checked={notificationType === "notice"}
                onChange={() => setNotificationType("notice")}
              />
              <label htmlFor="edit-notice-type" className="radio-label">
                お知らせ
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                className="notice-radio"
                name="notification-type"
                id="edit-donation-type"
                value="donation"
                checked={notificationType === "donation"}
                onChange={() => setNotificationType("donation")}
              />
              <label htmlFor="edit-donation-type" className="radio-label">
                寄贈
              </label>
            </div>

            <div className="flex items-center gap-6 ml-8">
              <div className="flex items-center">
                <input
                  type="radio"
                  className="notice-radio"
                  name="publish-status"
                  id="edit-publish"
                  value="public"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <label htmlFor="edit-publish" className="radio-label">
                  公開
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  className="notice-radio"
                  name="publish-status"
                  id="edit-private"
                  value="private"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                <label htmlFor="edit-private" className="radio-label">
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
        <label htmlFor="edit-upload" className="block mt-4">
          添付画像・ファイル
        </label>
        <div className="flex items-center gap-10">
          <input
            id="edit-upload"
            type="file"
            name="attachedFile"
            className="upload-btn"
            onChange={handleAttachedFileChange}
            multiple={false}
          />
          <label
            htmlFor="edit-upload"
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
                  className="absolute -top-2 -right-2 rounded w-10 h-10 flex items-center justify-center transition-colors"
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
                  <span className="text-3xl">&times;</span>
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
            type="submit"
            className="submit-btn"
            disabled={isLoading}
            label={isLoading ? "更新中..." : "更新"}
            style={{ width: "20%" }}
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

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中...</div>}>
      <EditNoticeContent />
    </Suspense>
  );
}
