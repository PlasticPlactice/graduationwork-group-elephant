/**
 * 通知アイテムの型定義
 */
export interface NotificationItem {
  id: number;
  date: string;
  title: string;
  image: string;
  content?: string;
  pdfUrl?: string;
  attachments?: { name: string; url: string }[];
}

/**
 * 通知APIレスポンスの型定義
 */
export interface NotificationApiResponse {
  data: NotificationItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 通知タイプの定数
 */
export const NotificationType = {
  NEWS: 0,
  DONATION: 1,
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];
