import { prisma } from "@/lib/prisma";
import { Book } from "@prisma/client";
import { BOOK_STATUS } from "@/lib/constants/bookStatus";

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
 * ISBNのフォーマット（ISBN-10 または ISBN-13）を簡易的に検証します。
 * ハイフンや空白は無視して判定し、チェックサムは検証しません。
 */
function isValidIsbnFormat(isbn: string): boolean {
  const normalized = isbn.trim().replace(/[-\s]/g, "");
  const isbn10Pattern = /^(?:\d{9}[\dX])$/;
  const isbn13Pattern = /^\d{13}$/;
  return isbn10Pattern.test(normalized) || isbn13Pattern.test(normalized);
}

/**
 * 部分的な日付表記を YYYY-MM-DD / YYYY-MM / YYYY に正規化します。
 * 変換できない場合は元の値を返します。
 */
function normalizePublishedDate(value?: string | null): string {
  if (!value) return "N/A";
  const trimmed = value.trim();
  // YYYY-MM-DD or YYYY/MM/DD
  const fullDate = trimmed.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/);
  if (fullDate) return `${fullDate[1]}-${fullDate[2]}-${fullDate[3]}`;

  // YYYY-MM or YYYY/MM
  const ym = trimmed.match(/^(\d{4})[-/.](\d{2})$/);
  if (ym) return `${ym[1]}-${ym[2]}`;

  // YYYY
  const y = trimmed.match(/^(\d{4})$/);
  if (y) return y[1];

  // 楽天の販売日フォーマット例: "2024年03月"
  const jpYm = trimmed.match(/^(\d{4})年(\d{2})月/);
  if (jpYm) return `${jpYm[1]}-${jpYm[2]}`;

  return trimmed;
}

/**
 * 楽天ブックスAPIを使用して書籍を検索します。
 * @param isbn - 検索する書籍のISBNコード。
 * @param appId - 楽天APIのアプリケーションID。
 * @returns 書籍情報のプロミス、または見つからない場合はnull。
 */
async function searchRakutenBooks(
  isbn: string,
  appId: string,
): Promise<(Omit<BookInfo, "source"> & { source: "RakutenBooks" }) | null> {
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${encodeURIComponent(
    appId,
  )}&isbn=${encodeURIComponent(isbn)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        errorText = "<failed to read response body>";
      }
      console.error(
        `Rakuten Books API request failed: ${response.status} ${response.statusText}`,
        errorText || undefined,
      );
      return null;
    }
    const rakutenData = await response.json();

    if (rakutenData.Items && rakutenData.Items.length > 0) {
      const item = rakutenData.Items[0].Item;
      return {
        title: item.title,
        author: item.author,
        imageUrl: item.largeImageUrl || item.mediumImageUrl || null,
        publisher: item.publisherName,
        publishedDate: normalizePublishedDate(item.salesDate),
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
  apiKey: string,
): Promise<(Omit<BookInfo, "source"> & { source: "GoogleBooks" }) | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
    isbn,
  )}&key=${encodeURIComponent(apiKey)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        errorBody = "<failed to read response body>";
      }
      console.error("Google Books API request failed", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody || undefined,
      });
      return null;
    }
    const googleData = await response.json();

    if (googleData.items && googleData.items.length > 0) {
      const volumeInfo = googleData.items[0].volumeInfo;
      return {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "N/A",
        imageUrl: volumeInfo.imageLinks?.thumbnail || null,
        publisher: volumeInfo.publisher || "N/A",
        publishedDate: normalizePublishedDate(volumeInfo.publishedDate),
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
  const normalizedIsbn = isbn.trim().replace(/[-\s]/g, "");

  // ISBNが明らかに不正な場合は処理しない
  if (!isValidIsbnFormat(normalizedIsbn)) {
    console.warn("searchBook called with invalid ISBN format:", isbn);
    return null;
  }

  const rakutenAppId = process.env.RAKUTEN_APP_ID;
  const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const TTL_DAYS = 30;
  const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 1. データベースでキャッシュを確認
  const cachedBook = await prisma.book.findUnique({
    where: { isbn: normalizedIsbn },
  });

  if (cachedBook) {
    const ageMs = now - cachedBook.cached_at.getTime();
    const isFresh = ageMs <= ttlMs;

    if (
      (cachedBook.status as unknown as number) === BOOK_STATUS.NOT_FOUND &&
      isFresh
    ) {
      return null; // ネガティブキャッシュ有効
    }

    if (
      (cachedBook.status as unknown as number) === BOOK_STATUS.FOUND &&
      isFresh
    ) {
      return formatBookFromDb(cachedBook);
    }
  }

  // 2. 外部APIで検索（並列で優先度付き）
  let bookData:
    | (Omit<BookInfo, "source"> & { source: "RakutenBooks" | "GoogleBooks" })
    | null = null;

  if (rakutenAppId && googleApiKey) {
    const [rakutenResult, googleResult] = await Promise.allSettled([
      searchRakutenBooks(normalizedIsbn, rakutenAppId),
      searchGoogleBooks(normalizedIsbn, googleApiKey),
    ]);

    if (rakutenResult.status === "fulfilled" && rakutenResult.value) {
      bookData = rakutenResult.value;
    } else if (googleResult.status === "fulfilled" && googleResult.value) {
      bookData = googleResult.value;
    }
  } else if (rakutenAppId) {
    bookData = await searchRakutenBooks(normalizedIsbn, rakutenAppId);
  } else if (googleApiKey) {
    bookData = await searchGoogleBooks(normalizedIsbn, googleApiKey);
  }

  // 3. 結果をデータベースに保存（同時リクエストに備えて upsert）
  if (bookData) {
    const savedBook = await prisma.book.upsert({
      where: { isbn: normalizedIsbn },
      update: {
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher,
        published_date: bookData.publishedDate,
        caption: bookData.description,
        image_url: bookData.imageUrl,
        cached_at: new Date(),
        status: BOOK_STATUS.FOUND as number,
      },
      create: {
        isbn: normalizedIsbn,
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher,
        published_date: bookData.publishedDate,
        caption: bookData.description,
        image_url: bookData.imageUrl,
        status: BOOK_STATUS.FOUND as number,
      },
    });
    return formatBookFromDb(savedBook);
  }

  // ネガティブキャッシュを保存（存在しない、または期限切れのNOT_FOUNDから再確認しても見つからない場合）
  await prisma.book.upsert({
    where: { isbn: normalizedIsbn },
    update: {
      title: "Unknown",
      author: null,
      publisher: null,
      caption: null,
      image_url: null,
      cached_at: new Date(),
      status: BOOK_STATUS.NOT_FOUND as number,
    },
    create: {
      isbn: normalizedIsbn,
      title: "Unknown",
      status: BOOK_STATUS.NOT_FOUND as number,
    },
  });
  return null;
}
