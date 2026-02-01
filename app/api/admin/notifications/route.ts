import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

/**
 * GET /api/admin/notifications
 * 管理者用: お知らせ一覧を取得する (検索, ソート, ページネーション対応)
 */
export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const sortBy = searchParams.get("sortBy") || "public_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // フィルタリング条件
    const title = searchParams.get("title")?.trim() || "";
    const type = searchParams.get("type");
    const isPublic = searchParams.get("isPublic");
    const isDraft = searchParams.get("isDraft");
    const publicDateFrom = searchParams.get("publicDateFrom");
    const publicDateTo = searchParams.get("publicDateTo");

    const where: Prisma.NotificationWhereInput = {
      deleted_flag: false, // 削除済みは表示しない
    };

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }
    if (type) {
      where.notification_type = parseInt(type);
    }
    if (isPublic) {
      where.public_flag = isPublic === "true";
    }
    if (isDraft) {
      where.draft_flag = isDraft === "true";
    }

    // 公開日の範囲フィルタ
    if (publicDateFrom || publicDateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};

      if (publicDateFrom) {
        const fromDate = new Date(publicDateFrom);
        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { message: "Invalid publicDateFrom" },
            { status: 400 },
          );
        }
        dateFilter.gte = fromDate;
      }

      if (publicDateTo) {
        const toDate = new Date(publicDateTo);
        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            { message: "Invalid publicDateTo" },
            { status: 400 },
          );
        }
        // 日付指定のみの場合はその日の末尾まで含めたいので 23:59:59.999 を足す
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }

      where.public_date = dateFilter;
    }

    const validSortColumns = [
      "title",
      "public_date",
      "notification_type",
      "updated_at",
    ];
    const finalSortBy = validSortColumns.includes(sortBy)
      ? sortBy
      : "public_date";
    const finalSortOrder = sortOrder === "desc" ? "desc" : "asc";

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: {
          [finalSortBy]: finalSortOrder,
        },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      data: notifications,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/notifications
 * 管理者用: 新しいお知らせを作成する
 */
export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      detail,
      public_flag,
      public_date,
      public_end_date,
      notification_type,
      draft_flag,
      fileIds, // 追加: 添付ファイルのID配列
    } = body;

    // バリデーション
    if (!title || !detail || !public_date || notification_type === undefined) {
      return NextResponse.json(
        { message: "必須項目が不足しています" },
        { status: 400 },
      );
    }

    const newNotification = await prisma.notification.create({
      data: {
        admin_id: parseInt(user.id),
        title,
        detail,
        public_flag: public_flag ?? false,
        public_date: new Date(public_date),
        public_end_date: public_end_date ? new Date(public_end_date) : null,
        notification_type: parseInt(notification_type),
        draft_flag: draft_flag ?? true,
        notificationFiles: {
          create:
            fileIds?.map((fileId: number, index: number) => ({
              file_id: fileId,
              sort_order: index, // 順序を保持
            })) || [],
        },
      },
      include: {
        notificationFiles: true, // 作成された関連ファイルも返す
      },
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
