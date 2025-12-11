import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get("isbn");
  const appId = process.env.RAKUTEN_APP_ID;

  if (!isbn || !appId) {
    return NextResponse.json(
      { error: "ISBNまたはappIdがありません" },
      { status: 400 }
    );
  }

  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${appId}&isbn=${isbn}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "楽天Books APIリクエスト失敗" },
        { status: 500 }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
