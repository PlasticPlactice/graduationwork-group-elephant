import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// イベント削除API (論理削除)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ID検証
    const params = await context.params;
    const eventId = Number(params.id);

    if (!Number.isFinite(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 },
      );
    }

    // イベント存在チェック
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deleted_flag) {
      return NextResponse.json(
        { message: "イベントが見つかりません" },
        { status: 404 },
      );
    }

    // 開催中のイベントは削除不可 (status: 0=開催前, 1=一次審査中, 2=二次審査中, 3=終了済)
    if (event.status >= 0 && event.status <= 2) {
      const now = new Date();

      // イベント期間中かチェック
      if (now >= event.start_period && now <= event.end_period) {
        return NextResponse.json(
          {
            message: "イベントが開催中のため削除できません",
            canDelete: false,
          },
          { status: 400 },
        );
      }

      // 一次審査期間中かチェック
      if (
        now >= event.first_voting_start_period &&
        now <= event.first_voting_end_period
      ) {
        return NextResponse.json(
          {
            message: "一次審査期間中のため削除できません",
            canDelete: false,
          },
          { status: 400 },
        );
      }

      // 二次審査期間中かチェック
      if (
        now >= event.second_voting_start_period &&
        now <= event.second_voting_end_period
      ) {
        return NextResponse.json(
          {
            message: "二次審査期間中のため削除できません",
            canDelete: false,
          },
          { status: 400 },
        );
      }
    }

    // 論理削除
    await prisma.event.update({
      where: { id: eventId },
      data: {
        deleted_flag: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "イベントが削除されました" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json(
      {
        message: "サーバーエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
