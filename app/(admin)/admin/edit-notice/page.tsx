"use client";

import React, { useEffect, useState } from "react";
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
  | { kind: "image"; src: string; name: string; file?: File }
  | { kind: "file"; name: string; file?: File };

// APIレスポンス用の簡易型
type RemoteNotificationFile = {
  file?: {
    original_filename?: string;
    name?: string;
    data_path?: string;
    type?: string;
  };
};

export default function Page() {
  const router = useRouter();
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
  const [existingThumbnailPath, setExistingThumbnailPath] = useState<
    string | null
  >(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedFilePreviews, setAttachedFilePreviews] = useState<
    UploadPreview[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // 初期データを取得
  useEffect(() => {
    if (notificationId === null) {
      setErrorMessage("お知らせIDが正しくありません。");
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

        if (data.public_date) {
          setPublicDateStart(
            format(parseISO(data.public_date), "yyyy-MM-dd'T'HH:mm"),
          );
        }

        if (data.public_end_date) {
          setPublicDateEnd(
            format(parseISO(data.public_end_date), "yyyy-MM-dd'T'HH:mm"),
          );
        }

        if (data.detail) {
          setDetailHtml(data.detail);
          editor?.commands.setContent(data.detail);
        }

        // 添付ファイルを処理
        if (data.notificationFiles && data.notificationFiles.length > 0) {
          // 最初のファイルをサムネイルとして扱う
          const firstFile = data.notificationFiles[0];
          if (firstFile?.file?.data_path) {
            setExistingThumbnailPath(firstFile.file.data_path);
            setThumbnailPreview(firstFile.file.data_path);
          }

          // 2番目以降のファイルを添付ファイルとして表示
          const remainingFiles = data.notificationFiles.slice(1);
          if (remainingFiles.length > 0) {
            const previews: UploadPreview[] = remainingFiles.map(
              (nf: RemoteNotificationFile) => {
                const fileName =
                  nf.file?.original_filename || nf.file?.name || "ファイル";
                const dataPath = nf.file?.data_path;
                const isImage =
                  nf.file?.type?.startsWith("image/") ||
                  fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

                if (isImage && dataPath) {
                  return {
                    kind: "image" as const,
                    src: dataPath,
                    name: fileName,
                    file: undefined,
                  };
                } else {
                  return {
                    kind: "file" as const,
                    name: fileName,
                    file: undefined,
                  };
                }
              },
            );
            setAttachedFilePreviews(previews);
          }
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "お知らせの取得中にエラーが発生しました。",
        );
      }
    };

    fetchNotification();
  }, [notificationId, editor]);

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
      // ファイルが選択されない場合、既存のサムネイルに戻す
      if (existingThumbnailPath) {
        setThumbnailFile(null);
        setThumbnailPreview(existingThumbnailPath);
      } else {
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
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
    e.currentTarget.value = "";

    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(
        "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。",
      );
      return;
    }

    // 最大4件まで
    if (attachedFiles.length >= 4) {
      alert("添付ファイルは最大4件までです。");
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
        },
      ]);
    } else {
      setAttachedFilePreviews((prev) => [
        ...prev,
        { kind: "file", name: file.name, file },
      ]);
    }
  };

  // 添付ファイルのプレビュー削除
  const removeAttachedFilePreview = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachedFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ファイルアップロード共通関数
  const uploadFile = async (file: File): Promise<number | null> => {
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
      return uploadedFile.id;
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

    if (notificationId === null) {
      setErrorMessage("お知らせIDが正しくありません。");
      setIsLoading(false);
      return;
    }

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

    try {
      // 1. ファイルアップロード
      const uploadedFileIds: number[] = [];

      // 既存のサムネイルがあり、新しいサムネイルが選択されていない場合は保持
      if (existingThumbnailPath && !thumbnailFile) {
        // 既存のサムネイルファイル ID を取得する必要がありますが、
        // 簡略化のため、既存ファイルは編集しないようにします
      }

      const totalFiles = (thumbnailFile ? 1 : 0) + attachedFiles.length;
      let uploadedCount = 0;

      if (thumbnailFile) {
        setUploadProgress(Math.round(((uploadedCount / totalFiles) * 100) / 2));
        const fileId = await uploadFile(thumbnailFile);
        if (fileId !== null) {
          uploadedFileIds.push(fileId);
          console.log("Uploaded new thumbnail with ID:", fileId);
        }
        uploadedCount++;
      } else if (existingThumbnailPath) {
        // 既存のサムネイルを保持する場合、ここで処理
      }

      for (const file of attachedFiles) {
        setUploadProgress(Math.round(((uploadedCount / totalFiles) * 100) / 2));
        const fileId = await uploadFile(file);
        if (fileId !== null) uploadedFileIds.push(fileId);
        uploadedCount++;
      }

      setUploadProgress(50);

      // 2. お知らせ更新API呼び出し
      setUploadProgress(75);
      const notificationTypeInt = notificationType === "notice" ? 0 : 1;
      const notificationData = {
        title: title,
        detail: detailHtml,
        public_flag: !saveAsDraft,
        public_date: parseISO(publicDateStart).toISOString(),
        public_end_date: publicDateEnd
          ? parseISO(publicDateEnd).toISOString()
          : null,
        notification_type: notificationTypeInt,
        draft_flag: saveAsDraft,
        fileIds: uploadedFileIds,
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
      setSuccessMessage("お知らせを更新しました。");

      // 2秒後にリダイレクト
      setTimeout(() => {
        router.push("/admin/notice");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "お知らせの更新中に不明なエラーが発生しました。";
      setErrorMessage(
        errorMessage || "お知らせの更新中にエラーが発生しました。",
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
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">お知らせ編集</h1>
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
        <section className="thumbnail-container h-50">
          <div className="thumbnail-inner flex justify-center relative">
            <input
              id="thumbnail"
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
                width={200}
                height={200}
                unoptimized
              />
            )}
            <label
              htmlFor="thumbnail"
              className="thumbnail-label inline-block px-3 py-2 cursor-pointer"
            >
              サムネイルを選択
            </label>
          </div>
        </section>

        <Textbox
          type="text"
          className="title w-full my-5"
          placeholder="タイトル"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-10">
            <div className="flex items-center">
              <input
                type="radio"
                className="notice-radio"
                name="notification-type"
                id="notice"
                value="notice"
                checked={notificationType === "notice"}
                onChange={() => setNotificationType("notice")}
              />
              <label htmlFor="notice" className="radio-label">
                お知らせ
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                className="notice-radio"
                name="notification-type"
                id="donation"
                value="donation"
                checked={notificationType === "donation"}
                onChange={() => setNotificationType("donation")}
              />
              <label htmlFor="donation" className="radio-label">
                寄贈
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
        <label htmlFor="upload" className="block mt-4">
          添付画像・ファイル
        </label>
        <div className="flex items-center gap-10">
          <input
            id="upload"
            type="file"
            name="attachedFile"
            className="upload-btn"
            onChange={handleAttachedFileChange}
            multiple={false}
          />
          <label
            htmlFor="upload"
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
              >
                {preview.kind === "image" ? (
                  <Image
                    src={preview.src}
                    alt={preview.name}
                    className="w-full h-full object-cover rounded"
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center text-xs p-2 break-words w-full h-full border border-gray-300 rounded">
                    <span className="truncate">{preview.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label="プレビューを削除"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttachedFilePreview(i);
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
            {Array.from({ length: 4 - attachedFilePreviews.length }).map(
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
            label={isLoading ? "更新中..." : "更新"}
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
                    width={800}
                    height={600}
                    unoptimized
                    style={{ maxHeight: "70vh", width: "auto", height: "auto" }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <p className="font-medium">ファイル名</p>
                  <p className="mt-2">
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
