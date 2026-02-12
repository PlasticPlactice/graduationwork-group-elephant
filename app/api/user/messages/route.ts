import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = (session as Session | null)?.user as { id: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userMessages = await prisma.userMessage.findMany({
      where: {
        user_id: Number(user.id),
      },
      include: {
        message: true,
      },
      orderBy: [{ created_at: "desc" }, { id: "asc" }],
    });
    return NextResponse.json(userMessages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
