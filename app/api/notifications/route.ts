import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface NotificationItem {
  id: number;
  date: string;
  title: string;
  image: string;
}

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
    const itemsPerPage = 4;

    if (isNaN(type) || isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "無効なパラメータです" },
        { status: 400 },
      );
    }

    // 総件数を取得
    const totalCount = await prisma.notification.count({
      where: {
        notification_type: type,
        public_flag: true,
        deleted_flag: false,
        draft_flag: false,
      },
    });

    // Notificationデータを取得
    const notifications = await prisma.notification.findMany({
      where: {
        notification_type: type,
        public_flag: true,
        deleted_flag: false,
        draft_flag: false,
      },
      include: {
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
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    // ItemProps 形式に変換
    const items: NotificationItem[] = notifications.map((notification) => {
      const image =
        notification.notificationFiles.length > 0
          ? notification.notificationFiles[0].file.data_path
          : "/top/image.png";

      return {
        id: notification.id,
        date: notification.public_date.toISOString().split("T")[0],
        title: notification.title,
        image: image,
      };
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

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
