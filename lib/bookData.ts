// lib/data.ts
import { prisma } from "@/lib/prisma";
import { toBookCardDTO } from "@/lib/mappers";

// この関数はサーバー側でしか動きません
export async function getPublicBookReviews(eventId: number) {
  const rawData = await prisma.bookReview.findMany({
    include: { user: true },
    where: {
      public_flag: true,
      evaluations_status: 1,
      deleted_flag: false,
      event_id: eventId,
    },
    orderBy: { created_at: "desc" },
  });
  // ここでDTO変換も済ませてしまうのが楽
  return rawData.map(toBookCardDTO);
}
