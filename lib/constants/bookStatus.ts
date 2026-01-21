/**
 * Book Status constants
 * 0 = FOUND: 書籍情報が見つかった
 * 1 = NOT_FOUND: 書籍情報が見つからなかった
 */
export const BOOK_STATUS = {
  FOUND: 0,
  NOT_FOUND: 1,
} as const;

export type BookStatusType = (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS];
