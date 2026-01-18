import { NotificationApiResponse } from "@/lib/types/notification";

/**
 * 通知データを取得する共通関数
 * @param type 通知タイプ (0: ニュース, 1: 寄贈)
 * @param page ページ番号
 * @returns 通知データまたはnull
 */
export async function getNotificationData(
  type: number,
  page: number,
): Promise<NotificationApiResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/notifications?type=${type}&page=${page}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error(`Failed to fetch notification data (type: ${type})`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
}
