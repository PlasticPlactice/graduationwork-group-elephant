"use client";
/* eslint-disable @next/next/no-img-element */
import "@/styles/admin/detail-notice.css";
import "@/styles/admin/notice-upload.css";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useToast } from "@/contexts/ToastContext";
import NoticeDisableModal from "@/components/admin/NoticeDisableModal";
import NoticeDeleteModal from "@/components/admin/NoticeDeleteModal";
import { normalizeFilePath, isImageFile } from "@/lib/pathUtils";

type ApiFile = {
  id?: number;
  name?: string;
  original_filename?: string | null;
  type?: string | null;
  data_path?: string | null;
};

type ApiNotificationFile = {
  sort_order: number;
  file: ApiFile | null;
};

type ApiNotification = {
  id: number;
  title: string;
  detail: string;
  public_flag: boolean;
  public_date: string;
  public_end_date?: string | null;
  notification_type: number;
  draft_flag: boolean;
  main_image_path?: string | null;
  notificationFiles: ApiNotificationFile[];
};

type Attachment = {
  kind: "image" | "file";
  src: string;
  name: string;
};

const getStatusLabel = (pub: boolean, draft: boolean): string => {
  if (draft) return "下書き";
  if (pub) return "公開中";
  return "非公開";
};

function DetailNoticeContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [notification, setNotification] = useState<ApiNotification | null>(
    null,
  );
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [isNoticeDisableModalOpen, setIsNoticeDisableModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeModal = () => setModalIndex(null);
  const openPreview = (index: number) => setModalIndex(index);

  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/admin/notifications/${id}`);
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        const data: ApiNotification = await res.json();
        setNotification(data);
      } catch (err) {
        console.error("Failed to fetch notification detail", err);
      }
    };
    fetchDetail();
  }, [id]);

  const thumbnailSrc = useMemo(() => {
    // main_image_path をサムネイルとして表示
    const mp = notification?.main_image_path;
    if (!mp) return undefined;
    // 完全URLの場合はそのまま返す
    if (mp.startsWith("http://") || mp.startsWith("https://")) return mp;
    // 相対パスの場合は正規化
    return normalizeFilePath(mp);
  }, [notification]);

  const attachments: Attachment[] = useMemo(() => {
    // notificationFiles にはメイン画像が含まれないため、そのまま使用
    return (notification?.notificationFiles ?? [])
      .map((nf) => {
        const file = nf.file;
        const name = file?.original_filename || file?.name || "ファイル";
        const dataPath = file?.data_path;
        if (!dataPath) return null;
        const path = normalizeFilePath(dataPath);
        const isImage =
          isImageFile(name) || (file?.type ?? "").startsWith("image/");
        return {
          kind: isImage ? ("image" as const) : ("file" as const),
          src: path,
          name,
        };
      })
      .filter((p): p is Attachment => p !== null);
  }, [notification]);

  const handleEdit = () => {
    if (id) {
      router.push(`/admin/edit-notice?id=${id}`);
    } else {
      router.push("/admin/edit-notice");
    }
  };

  const handleNoticeDisable = () => {
    setIsNoticeDisableModalOpen(true);
  };
  const closeNoticeDisableModal = () => {
    setIsNoticeDisableModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!notification) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/notifications/${notification.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        addToast({
          type: "error",
          message: error.message || "削除に失敗しました",
        });
        return;
      }

      addToast({ type: "success", message: "お知らせを削除しました" });
      router.push("/admin/notice");
    } catch (err) {
      console.error("Delete error:", err);
      addToast({ type: "error", message: "削除に失敗しました" });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const confirmToggle = async () => {
    try {
      if (!notification) return;
      const fileIds = (notification.notificationFiles || [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((nf) => nf.file?.id)
        .filter((fid): fid is number => typeof fid === "number");

      const newPublicFlag = !notification.public_flag;
      // 下書きから公開する場合はdraft_flagもfalseにする
      const newDraftFlag = newPublicFlag ? false : notification.draft_flag;

      const payload = {
        title: notification.title,
        detail: notification.detail,
        public_flag: newPublicFlag,
        public_date: new Date(notification.public_date).toISOString(),
        public_end_date: notification.public_end_date
          ? new Date(notification.public_end_date).toISOString()
          : null,
        notification_type: notification.notification_type,
        draft_flag: newDraftFlag,
        fileIds,
      };

      const res = await fetch(`/api/admin/notifications/${notification.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Failed: ${res.status}`);
      }
      // 画面上のステータスを更新
      setNotification((prev) =>
        prev
          ? { ...prev, public_flag: newPublicFlag, draft_flag: newDraftFlag }
          : prev,
      );
      addToast({
        type: "success",
        message: newPublicFlag
          ? "お知らせを公開しました。"
          : "お知らせを非公開にしました。",
      });
      setIsNoticeDisableModalOpen(false);
    } catch (error) {
      console.error("Failed to toggle notification:", error);
      addToast({
        type: "error",
        message: "お知らせの公開/非公開の切り替えに失敗しました。",
      });
    }
  };

  const publicStart = notification?.public_date
    ? format(new Date(notification.public_date), "yyyy-MM-dd", { locale: ja })
    : "";

  return (
    <main className="p-6">
      {/* サムネイル（`main_image_path` が設定されている場合のみ表示） */}
      {thumbnailSrc ? (
        <section className="thumbnail-container" style={{ height: "200px" }}>
          <div
            className="thumbnail-inner flex justify-center relative"
            style={{ width: "100%", height: "100%" }}
          >
            <img
              src={thumbnailSrc}
              alt="サムネイル"
              className="thumbnail-preview w-full"
            />
          </div>
        </section>
      ) : null}

      {/* タイトル */}
      <h1 className="notice-title font-bold">{notification?.title ?? ""}</h1>

      {/* 日付 + ステータス */}
      <div className="flex items-center">
        <div className="date-range flex mr-3">
          <p>{publicStart}</p>
        </div>
        <p
          className={
            "status ml-2 px-4 py-1 " +
            (notification?.draft_flag
              ? "status-draft"
              : notification?.public_flag
                ? "status-public"
                : "status-private")
          }
        >
          {notification
            ? getStatusLabel(notification.public_flag, notification.draft_flag)
            : ""}
        </p>
      </div>

      {/* 本文（HTML） */}
      <div
        className="my-4"
        dangerouslySetInnerHTML={{ __html: notification?.detail ?? "" }}
      />

      {/* 添付 */}
      {attachments.length > 0 && (
        <>
          <p className="img-file">添付画像・ファイル</p>
          <div className="flex justify-between flex-wrap">
            <div className="flex flex-wrap gap-4 mb-6">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden upload-preview w-1/4"
                >
                  {att.kind === "image" ? (
                    <img
                      src={att.src}
                      onClick={() => openPreview(idx)}
                      alt={att.name}
                      className="img-border w-full h-full object-cover h-20 flex items-center justify-center text-sm text-black"
                    />
                  ) : (
                    <div
                      className="img-border w-full h-20 flex items-center justify-center text-sm text-black"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-main)",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* 操作ボタン */}
            <div className="btn-group flex items-center gap-4">
              <button onClick={handleEdit} className="edit-btn">
                編集する
              </button>
              <button
                className={
                  notification?.public_flag ? "not-public-btn" : "public-btn"
                }
                onClick={handleNoticeDisable}
              >
                {notification?.public_flag ? "非公開にする" : "公開する"}
              </button>
              <button onClick={handleDelete} className="delete-conf-btn">
                削除する
              </button>
            </div>
          </div>
        </>
      )}
      {/* 添付画像・ファイルがないとき */}
      {attachments.length === 0 && (
        <>
          <div className="btn-group flex justify-end items-center gap-4">
            <button onClick={handleEdit} className="edit-btn">
              編集する
            </button>
            <button
              className={
                notification?.public_flag ? "not-public-btn" : "public-btn"
              }
              onClick={handleNoticeDisable}
            >
              {notification?.public_flag ? "非公開にする" : "公開する"}
            </button>
            <button onClick={handleDelete} className="delete-conf-btn">
              削除する
            </button>
          </div>
        </>
      )}

      {/* プレビューモーダル */}
      {modalIndex !== null &&
        attachments[modalIndex] &&
        attachments[modalIndex].kind === "image" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 preview-modal"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded p-4 max-w-[100%] max-h-[100%] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-medium">プレビュー</h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>
              <div className="mt-4">
                <img
                  src={attachments[modalIndex].src}
                  alt={attachments[modalIndex].name}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}

      {/* モーダル */}
      <NoticeDisableModal
        isOpen={isNoticeDisableModalOpen}
        onClose={closeNoticeDisableModal}
        onConfirm={confirmToggle}
        isPublic={notification?.public_flag ?? false}
      />
      <NoticeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <DetailNoticeContent />
    </Suspense>
  );
}
