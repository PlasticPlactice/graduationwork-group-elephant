import { BookshelfTop } from "@/components/bookshelf/BookshelfTop";
import { getPublicBookReviews } from "@/lib/bookData";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    id: string;
  };
};

export default async function BookshelfDetailPage({ params }: Props) {
  const resolvedParams = await params;

  const bookReviews = await getPublicBookReviews(Number(resolvedParams.id));

  console.log(bookReviews)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-6">
        <BookshelfTop reviews={bookReviews}/>
      </div>
    </div>
  );
}
