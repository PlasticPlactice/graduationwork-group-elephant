import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: {
    id: string;
  };
};

const normalizeId = (
  paramsId: string | string[] | undefined,
  pathname: string,
): string => {
  const paramValue = Array.isArray(paramsId) ? paramsId[0] : paramsId;
  if (paramValue) return paramValue;

  const segments = pathname.split("/").filter(Boolean);
  return segments.pop() ?? "";
};

/**
 * GET /api/admin/notifications/:id
 * 管理者用: 特定のお知らせの詳細を取得する
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const rawId = normalizeId(context.params?.id, req.nextUrl.pathname);

  console.log("[notifications/:id GET] params:", context.params);
  console.log("[notifications/:id GET] raw id param:", rawId);

  // 認証チェック
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notificationId = Number(rawId);
    console.log("[notifications/:id GET] parsed id:", notificationId);
    if (!Number.isFinite(notificationId)) {
      return NextResponse.json(
        { message: "Invalid ID", rawId },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId, deleted_flag: false },
      include: {
        notificationFiles: {
          include: {
            file: true,
          },
          orderBy: {
            sort_order: "asc",
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error(`Error fetching notification ${rawId}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/notifications/:id
 * 管理者用: 特定のお知らせを更新する
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const rawId = normalizeId(context.params?.id, req.nextUrl.pathname);

  console.log("[notifications/:id PUT] params:", context.params);
  console.log("[notifications/:id PUT] raw id param:", rawId);

  // 認証チェック
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notificationId = Number(rawId);
    if (!Number.isFinite(notificationId)) {
      return NextResponse.json(
        { message: "Invalid ID", rawId },
        { status: 400 },
      );
    }

    const body = await req.json();
    console.log(
      "[notifications/:id PUT] request body:",
      JSON.stringify(body).substring(0, 500),
    );

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
    if (!title) {
      return NextResponse.json(
        { message: "Title is required", receivedTitle: title },
        { status: 400 },
      );
    }
    if (!detail) {
      return NextResponse.json(
        { message: "Detail is required", receivedDetail: detail },
        { status: 400 },
      );
    }
    if (!public_date) {
      return NextResponse.json(
        { message: "Public date is required", receivedPublicDate: public_date },
        { status: 400 },
      );
    }
    if (notification_type === undefined || notification_type === null) {
      return NextResponse.json(
        {
          message: "Notification type is required",
          receivedType: notification_type,
        },
        { status: 400 },
      );
    }

    // notification_type を数値に変換
    let notificationTypeInt: number;
    try {
      notificationTypeInt = parseInt(String(notification_type), 10);
      if (!Number.isFinite(notificationTypeInt)) {
        return NextResponse.json(
          {
            message: "Invalid notification_type",
            receivedType: notification_type,
          },
          { status: 400 },
        );
      }
    } catch (parseError) {
      console.error("Error parsing notification_type:", parseError);
      return NextResponse.json(
        { message: "Failed to parse notification_type" },
        { status: 400 },
      );
    }

    console.log(
      "[notifications/:id PUT] parsed notification_type:",
      notificationTypeInt,
    );

    // Date オブジェクトへの変換
    let publicDateObj: Date;
    let publicEndDateObj: Date | null = null;
    try {
      publicDateObj = new Date(public_date);
      if (isNaN(publicDateObj.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid public_date format",
            receivedPublicDate: public_date,
          },
          { status: 400 },
        );
      }
      console.log(
        "[notifications/:id PUT] public_date converted to:",
        publicDateObj.toISOString(),
      );

      if (public_end_date && public_end_date.trim() !== "") {
        publicEndDateObj = new Date(public_end_date);
        if (isNaN(publicEndDateObj.getTime())) {
          return NextResponse.json(
            {
              message: "Invalid public_end_date format",
              receivedPublicEndDate: public_end_date,
            },
            { status: 400 },
          );
        }
        console.log(
          "[notifications/:id PUT] public_end_date converted to:",
          publicEndDateObj.toISOString(),
        );
      }
    } catch (dateError) {
      console.error("Error parsing dates:", dateError);
      return NextResponse.json(
        { message: "Failed to parse date fields" },
        { status: 400 },
      );
    }

    // 既存のNotificationFileを削除し、新しいもので再作成
    const transaction = await prisma.$transaction(
      async (tx) => {
        // 既存の関連ファイルを全て削除
        console.log(
          "[notifications/:id PUT] deleting old files for:",
          notificationId,
        );
        await tx.notificationFile.deleteMany({
          where: { notification_id: notificationId },
        });

        // 通知を更新
        console.log(
          "[notifications/:id PUT] updating notification:",
          notificationId,
        );
        const updateData: Prisma.NotificationUpdateInput = {
          title,
          detail,
          public_flag: public_flag ?? false,
          public_date: publicDateObj,
          notification_type: notificationTypeInt,
          draft_flag: draft_flag ?? true,
          updated_at: new Date(),
        };

        // public_end_date は optional なので、null でも OK
        if (publicEndDateObj !== null) {
          updateData.public_end_date = publicEndDateObj;
        }

        console.log(
          "[notifications/:id PUT] update data keys:",
          Object.keys(updateData),
        );

        const updatedNotification = await tx.notification.update({
          where: { id: notificationId },
          data: updateData,
        });
        console.log(
          "[notifications/:id PUT] notification updated successfully",
        );

        // 新しい関連ファイルを作成
        if (fileIds && fileIds.length > 0) {
          console.log(
            "[notifications/:id PUT] creating",
            fileIds.length,
            "files",
          );
          await tx.notificationFile.createMany({
            data: fileIds.map((fileId: number, index: number) => ({
              notification_id: notificationId,
              file_id: fileId,
              sort_order: index,
            })),
          });
          console.log("[notifications/:id PUT] files created successfully");
        }
        return updatedNotification;
      },
      { timeout: 10000 },
    );

    console.log("[notifications/:id PUT] transaction completed successfully");
    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error(`Error updating notification ${rawId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: errorMessage,
        notificationId: rawId,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/notifications/:id
 * 管理者用: 特定のお知らせを削除する (ソフトデリート)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const rawId = normalizeId(context.params?.id, req.nextUrl.pathname);

  console.log("[notifications/:id DELETE] params:", context.params);
  console.log("[notifications/:id DELETE] raw id param:", rawId);

  // 認証チェック
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notificationId = Number(rawId);
    if (!Number.isFinite(notificationId)) {
      return NextResponse.json(
        { message: "Invalid ID", rawId },
        { status: 400 },
      );
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        deleted_flag: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting notification ${rawId}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
