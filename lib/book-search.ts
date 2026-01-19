import { prisma } from "@/lib/prisma";
import { Book } from "@prisma/client";

// 標準化された書籍情報レスポンスの型定義
export interface BookInfo {
  title: string;
  author: string;
  imageUrl: string | null;
  publisher: string;
  publishedDate: string;
  description: string;
  source: "RakutenBooks" | "GoogleBooks" | "Cache";
}

// PrismaのBookモデルをBookInfoインターフェースに変換
function formatBookFromDb(book: Book): BookInfo {
  return {
    title: book.title,
    author: book.author || "N/A",
    imageUrl: book.image_url,
    publisher: book.publisher || "N/A",
    publishedDate: book.published_date || "N/A",
    description: book.caption || "N/A",
    source: "Cache",
  };
}

/**
 * 楽天ブックスAPIを使用して書籍を検索します。
 * @param isbn - 検索する書籍のISBNコード。
 * @param appId - 楽天APIのアプリケーションID。
 * @returns 書籍情報のプロミス、または見つからない場合はnull。
 */
async function searchRakutenBooks(
  isbn: string,
  appId: string
): Promise<Omit<BookInfo, "source"> & { source: "RakutenBooks" } | null> {
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${appId}&isbn=${isbn}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Rakuten Books API request failed");
      return null;
    }
    const data = await response.json();

    if (data.Items && data.Items.length > 0) {
      const item = data.Items[0].Item;
      return {
        title: item.title,
        author: item.author,
        imageUrl: item.largeImageUrl || item.mediumImageUrl || null,
        publisher: item.publisherName,
        publishedDate: item.salesDate,
        description: item.itemCaption,
        source: "RakutenBooks",
      };
    }
    return null;
  } catch (error) {
    console.error("Error in searchRakutenBooks:", error);
    return null;
  }
}

/**
 * GoogleブックスAPIを使用して書籍を検索します。
 * @param isbn - 検索する書籍のISBNコード。
 * @param apiKey - GoogleブックスAPIのキー。
 * @returns 書籍情報のプロミス、または見つからない場合はnull。
 */
async function searchGoogleBooks(
  isbn: string,
  apiKey: string
): Promise<Omit<BookInfo, "source"> & { source: "GoogleBooks" } | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Google Books API request failed");
      return null;
    }
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const volumeInfo = data.items[0].volumeInfo;
      return {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "N/A",
        imageUrl: volumeInfo.imageLinks?.thumbnail || null,
        publisher: volumeInfo.publisher || "N/A",
        publishedDate: volumeInfo.publishedDate,
        description: volumeInfo.description || "N/A",
        source: "GoogleBooks",
      };
    }
    return null;
  } catch (error) {
    console.error("Error in searchGoogleBooks:", error);
    return null;
  }
}

/**
 * 複数の書籍検索APIを順番に試し、データベースキャッシュを利用して書籍情報を取得します。
 * @param isbn - 検索する書籍のISBNコード。
 * @returns 書籍情報が見つかった場合はその情報、見つからない場合はnull。
 */
export async function searchBook(isbn: string): Promise<BookInfo | null> {
  // 1. データベースでキャッシュを確認
  const cachedBook = await prisma.book.findUnique({
    where: { isbn },
  });

  if (cachedBook) {
    if (cachedBook.status === "NOT_FOUND") {
      return null; // ネガティブキャッシュヒット
    }

    // TODO: TTL（キャッシュ有効期限）のチェックロジックをここに追加
    // 例: if ((new Date().getTime() - cachedBook.cached_at.getTime()) / (1000 * 60 * 60 * 24) > 30) { /* 再取得ロジック */ }

    return formatBookFromDb(cachedBook); // キャッシュヒット
  }

  // 2. 外部APIで検索
  const rakutenAppId = process.env.RAKUTEN_APP_ID;
  const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;
  let bookData: Omit<BookInfo, "source"> & { source: "RakutenBooks" | "GoogleBooks" } | null = null;

  if (rakutenAppId) {
    bookData = await searchRakutenBooks(isbn, rakutenAppId);
  }

  if (!bookData && googleApiKey) {
    bookData = await searchGoogleBooks(isbn, googleApiKey);
  }

  // 3. 結果をデータベースに保存
  if (bookData) {
    const newBook = await prisma.book.create({
      data: {
        isbn: isbn,
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher,
        published_date: bookData.publishedDate,
        caption: bookData.description,
        image_url: bookData.imageUrl,
        cached_at: new Date(),
        status: "FOUND",
      },
    });
    return formatBookFromDb(newBook);
  } else {
    // ネガティブキャッシュを保存
    await prisma.book.create({
      data: {
        isbn: isbn,
        title: "Unknown", // 不明な書籍として記録
        status: "NOT_FOUND",
        cached_at: new Date(),
      },
    });
    return null;
  }
}
