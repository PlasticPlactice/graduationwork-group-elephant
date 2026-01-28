export type EventDateInputs = {
  start_period?: string | Date | null;
  end_period?: string | Date | null;
  first_voting_start_period?: string | Date | null;
  first_voting_end_period?: string | Date | null;
  second_voting_start_period?: string | Date | null;
  second_voting_end_period?: string | Date | null;
};

/**
 * 与えられた日付フィールドを検証する。
 * - 文字列や Date を受け取り、提供されたものだけ検証する。
 * - 無効な日付があれば英語のキーまたは日本語メッセージを返す。
 * - 期間の前後関係が不正なら対応する日本語メッセージを返す。
 * - 問題なければ null を返す。
 */
export function validateEventDates(d: EventDateInputs): string | null {
  const toDate = (v: string | Date | null | undefined): Date | null => {
    if (v === undefined || v === null || v === "") return null;
    if (v instanceof Date) return v;
    const n = new Date(v);
    return isNaN(n.getTime()) ? null : n;
  };

  const s = d.start_period !== undefined ? (toDate(d.start_period) ?? 'INVALID') : undefined;
  const e = d.end_period !== undefined ? (toDate(d.end_period) ?? 'INVALID') : undefined;
  const fs = d.first_voting_start_period !== undefined ? (toDate(d.first_voting_start_period) ?? 'INVALID') : undefined;
  const fe = d.first_voting_end_period !== undefined ? (toDate(d.first_voting_end_period) ?? 'INVALID') : undefined;
  const ss = d.second_voting_start_period !== undefined ? (toDate(d.second_voting_start_period) ?? 'INVALID') : undefined;
  const se = d.second_voting_end_period !== undefined ? (toDate(d.second_voting_end_period) ?? 'INVALID') : undefined;

  if (s === 'INVALID') return 'start_period is invalid date';
  if (e === 'INVALID') return 'end_period is invalid date';
  if (fs === 'INVALID') return 'first_voting_start_period is invalid date';
  if (fe === 'INVALID') return 'first_voting_end_period is invalid date';
  if (ss === 'INVALID') return 'second_voting_start_period is invalid date';
  if (se === 'INVALID') return 'second_voting_end_period is invalid date';

  // 比較は両端が Date のときのみ
  if (s instanceof Date && e instanceof Date && s > e) {
    return 'イベント開始日時よりイベント終了日時の方が早いです。';
  }
  if (fs instanceof Date && fe instanceof Date && fs > fe) {
    return '一次審査開始日時より一次審査終了日時の方が早いです。';
  }
  if (ss instanceof Date && se instanceof Date && ss > se) {
    return '二次審査開始日時より二次審査終了日時の方が早いです。';
  }

  return null;
}
