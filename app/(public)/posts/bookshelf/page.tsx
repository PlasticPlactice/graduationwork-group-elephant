import { BookshelfTop } from "@/components/bookshelf/BookshelfTop";
import { getPublicBookReviews } from "@/lib/bookData";

export const dynamic = "force-dynamic";

export default async function BookshelfDetailPage() {


  const bookReviews = await getPublicBookReviews(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-6">
        <BookshelfTop reviews={bookReviews}/>
      </div>
    </div>
  );
}
