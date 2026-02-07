"use client";
/* eslint-disable @next/next/no-img-element */
import "@/styles/admin/detail-notice.css";
import "@/styles/admin/notice-upload.css";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useMemo, useState, Suspense } from "react";
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
        const isImage = isImageFile(name) || (file?.type ?? "").startsWith("image/");
        return { kind: isImage ? "image" as const : "file" as const, src: path, name };
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
        alert(error.message || "削除に失敗しました");
        return;
      }

      alert("お知らせを削除しました");
      router.push("/admin/notice");
    } catch (err) {
      console.error("Delete error:", err);
      alert("削除に失敗しました");
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
      setIsNoticeDisableModalOpen(false);
    } catch (error) {
      console.error("Failed to toggle notification:", error);
      alert("お知らせの公開/非公開の切り替えに失敗しました。");
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
          <div className="flex flex-wrap">
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
                  <div className="img-border w-full h-20 flex items-center justify-center text-sm text-black">
                    {att.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 操作ボタン */}
      <div className="btn-group flex items-center mt-6">
        <button
          className={
            notification?.public_flag ? "not-public-btn" : "public-btn"
          }
          onClick={handleNoticeDisable}
        >
          {notification?.public_flag ? "非公開にする" : "公開する"}
        </button>
        <div className="ml-auto flex gap-2">
          <button
            className="close-btn"
            onClick={() => router.push("/admin/notice")}
          >
            閉じる
          </button>
          <button onClick={handleEdit} className="edit-btn">
            編集する
          </button>
          <button onClick={handleDelete} className="delete-conf-btn">
            削除する
          </button>
        </div>
      </div>

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
