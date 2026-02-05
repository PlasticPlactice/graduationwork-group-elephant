import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  NotificationItem,
  NotificationType,
  NotificationTypeValue,
} from "@/lib/types/notification";

// 1ページあたりの表示件数
const ITEMS_PER_PAGE = 8;

// 許可される通知タイプの値
const VALID_NOTIFICATION_TYPES: readonly NotificationTypeValue[] = [
  NotificationType.NEWS,
  NotificationType.DONATION,
] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationType = searchParams.get("type");
    const pageParam = searchParams.get("page");

    // バリデーション
    if (notificationType === null) {
      return NextResponse.json(
        { error: "type パラメータが必要です" },
        { status: 400 },
      );
    }

    const type = parseInt(notificationType, 10);
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (isNaN(type) || isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "無効なパラメータです" },
        { status: 400 },
      );
    }

    // 通知タイプの範囲チェック
    if (!VALID_NOTIFICATION_TYPES.includes(type as NotificationTypeValue)) {
      return NextResponse.json(
        {
          error: `無効なtypeパラメータです。許可される値は ${VALID_NOTIFICATION_TYPES.join(", ")} です。`,
        },
        { status: 400 },
      );
    }

    // 共通のWHERE条件を定義
    const now = new Date();
    const whereCondition = {
      notification_type: type,
      public_flag: true,
      deleted_flag: false,
      draft_flag: false,
      // 公開開始日時の確認：public_dateが現在時刻以前の場合のみ表示
      public_date: { lte: now },
      // 公開終了日時の確認：public_end_dateが設定されていない、または現在時刻以降の場合のみ表示
      OR: [{ public_end_date: null }, { public_end_date: { gt: now } }],
    };

    // 総件数を取得
    const totalCount = await prisma.notification.count({
      where: whereCondition,
    });

    // Notificationデータを取得
    const notifications = await prisma.notification.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        detail: true,
        public_date: true,
        notificationFiles: {
          where: {
            deleted_flag: false,
          },
          include: {
            file: true,
          },
          orderBy: {
            sort_order: "asc",
          },
        },
      },
      orderBy: {
        public_date: "desc",
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    // NotificationItem 形式に変換
    const items: NotificationItem[] = notifications.map((notification) => {
      // ユーティリティ関数
      const isImageFile = (path: string): boolean =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(path);

      const normalizePath = (path: string): string =>
        path.startsWith("/") ? path : `/${path}`;

      // メイン画像の特定：最初の画像ファイルのインデックスを探す
      const imageFileIndex = notification.notificationFiles.findIndex((nf) =>
        isImageFile(nf.file.data_path),
      );

      // PDF ファイルを探す
      const pdfFile = notification.notificationFiles.find((nf) =>
        nf.file.data_path.toLowerCase().endsWith(".pdf"),
      );

      // メイン画像のパス
      const image =
        imageFileIndex >= 0
          ? normalizePath(
              notification.notificationFiles[imageFileIndex].file.data_path,
            )
          : "/top/image.png";

      // 添付ファイル：メイン画像以外のすべてのファイル
      const attachments = notification.notificationFiles
        .filter((_, index) => index !== imageFileIndex)
        .map((nf) => ({
          name: nf.file.name,
          url: normalizePath(nf.file.data_path),
        }));

      return {
        id: notification.id,
        date: notification.public_date.toISOString().split("T")[0],
        title: notification.title,
        content: notification.detail || undefined,
        image,
        pdfUrl: pdfFile ? normalizePath(pdfFile.file.data_path) : undefined,
        attachments,
      };
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return NextResponse.json({
      data: items,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
