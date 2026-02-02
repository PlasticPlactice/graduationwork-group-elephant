import { BookshelfTop } from "@/components/bookshelf/BookshelfTop";
import { getPublicBookReviews } from "@/lib/bookData";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BookshelfDetailPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams.event_id as string | undefined;

  const bookReviews = await getPublicBookReviews(Number(eventId));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-6">
        <BookshelfTop reviews={bookReviews}/>
      </div>
    </div>
  );
}
