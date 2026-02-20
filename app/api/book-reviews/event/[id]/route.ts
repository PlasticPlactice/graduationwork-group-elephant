import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 管理者向け - 指定したイベントIDの書評をすべて取得するAPI
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: { id?: string };
    } | null;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    const { id } = await params;

    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid review id" },
        { status: 400 },
      );
    }

    const reviews = await prisma.bookReview.findMany({
      where: {
        event_id: eventId,
        deleted_flag: false,
      },
      orderBy: [{ created_at: "desc" }, { id: "asc" }],
    });

    if (!reviews) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch review" },
      { status: 500 },
    );
  }
}
