import { BookshelfTop } from "@/components/bookshelf/BookshelfTop";
import { getPublicBookReviews } from "@/lib/bookData";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    id: string;
  };
};

export default async function BookshelfDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  const [bookReviews, event] = await Promise.all([
    getPublicBookReviews(eventId),
    prisma.event.findUnique({
      where: { id: eventId },
      select: { status: true },
    }),
  ]);

  console.log(bookReviews);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-6">
        <BookshelfTop reviews={bookReviews} eventStatus={event?.status ?? 0} />
      </div>
    </div>
  );
}
