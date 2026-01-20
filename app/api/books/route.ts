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
      return NextResponse.json(bookInfo);
    } else {
      return NextResponse.json(
        { error: "書籍が見つかりませんでした" },
        { status: 404 },
      );
    }
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
