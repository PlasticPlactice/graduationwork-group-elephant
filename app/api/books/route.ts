import { NextRequest, NextResponse } from "next/server";
import { searchBook } from "@/lib/book-search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json({ error: "ISBNがありません" }, { status: 400 });
  }

  try {
    const bookInfo = await searchBook(isbn);

    if (bookInfo) {
      const legacyShape = {
        Items: [
          {
            Item: {
              title: bookInfo.title,
              author: bookInfo.author,
              mediumImageUrl: bookInfo.imageUrl,
              imageUrl: bookInfo.imageUrl,
              publisher: bookInfo.publisher,
              salesDate: bookInfo.publishedDate,
              itemCaption: bookInfo.description,
              source: bookInfo.source,
            },
          },
        ],
      };

      return NextResponse.json({ ...bookInfo, ...legacyShape });
    } else {
      return NextResponse.json(
        { error: "書籍が見つかりませんでした" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Book search API error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
