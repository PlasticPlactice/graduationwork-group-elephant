export type EventDateInputs = {
  start_period?: string | Date | null;
  end_period?: string | Date | null;
  first_voting_start_period?: string | Date | null;
  first_voting_end_period?: string | Date | null;
  second_voting_start_period?: string | Date | null;
  second_voting_end_period?: string | Date | null;
};

/**
 * 与えられた日付フィールドを検証する（可読性重視の実装）。
 * 戻り値は問題があれば日本語メッセージ配列、問題なければnull。
 */
export function validateEventDates(d: EventDateInputs): string[] | null {
  const parseDate = (v: string | Date | null | undefined): Date | null => {
    if (v === undefined || v === null || v === "") return null;
    if (v instanceof Date) return v;
    const parsed = new Date(v);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  // undefined（未指定）か、Date / INVALID のどれかになるラッパー
  const wrap = (val: string | Date | null | undefined) =>
    val === undefined ? undefined : (parseDate(val) ?? "INVALID");

  const start = wrap(d.start_period);
  const end = wrap(d.end_period);
  const postStart = wrap(d.first_voting_start_period);
  const postEnd = wrap(d.first_voting_end_period);
  const voteStart = wrap(d.second_voting_start_period);
  const voteEnd = wrap(d.second_voting_end_period);

  const messages: string[] = [];

  // ----------------
  // フォーマット（無効日付）のチェック
  // ----------------
  if (start === "INVALID")
    messages.push("イベント開始日時の形式が正しくありません。");
  if (end === "INVALID")
    messages.push("イベント終了日時の形式が正しくありません。");
  if (postStart === "INVALID")
    messages.push("書評投稿開始日時の形式が正しくありません。");
  if (postEnd === "INVALID")
    messages.push("書評投稿終了日時の形式が正しくありません。");
  if (voteStart === "INVALID")
    messages.push("書評投票開始日時の形式が正しくありません。");
  if (voteEnd === "INVALID")
    messages.push("書評投票終了日時の形式が正しくありません。");

  const isDate = (v: unknown): v is Date => v instanceof Date;

  // 短いヘルパ: 同一期間内の前後関係チェック
  const checkRange = (a: unknown, b: unknown, msg: string) => {
    if (isDate(a) && isDate(b) && a >= b) messages.push(msg);
  };

  checkRange(
    start,
    end,
    "イベント開始日時はイベント終了日時より前に設定してください。",
  );
  checkRange(
    postStart,
    postEnd,
    "書評投稿開始日時は書評投稿終了日時より前に設定してください。",
  );
  checkRange(
    voteStart,
    voteEnd,
    "書評投票開始日時は書評投票終了日時より前に設定してください。",
  );

  // ----------------
  // 全体の厳密な順序チェック（すべての日時が存在する場合）
  // start < postStart < postEnd < voteStart < voteEnd < end
  // ----------------
  const allDatesPresent = [
    start,
    end,
    postStart,
    postEnd,
    voteStart,
    voteEnd,
  ].every(isDate);
  if (allDatesPresent) {
    checkRange(
      start,
      postStart,
      "イベント開始日時は書評投稿開始日時より前に設定してください。",
    );
    checkRange(
      postStart,
      postEnd,
      "書評投稿開始日時は書評投稿終了日時より前に設定してください。",
    );
    checkRange(
      postEnd,
      voteStart,
      "書評投稿終了日時は書評投票開始日時より前に設定してください。",
    );
    checkRange(
      voteStart,
      voteEnd,
      "書評投票開始日時は書評投票終了日時より前に設定してください。",
    );
    checkRange(
      voteEnd,
      end,
      "書評投票終了日時はイベント終了日時より前に設定してください。",
    );
  }

  // ----------------
  // オーバーラップ検出（投稿期間と投票期間など）
  // ----------------
  const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) =>
    aS < bE && bS < aE;

  if (
    isDate(postStart) &&
    isDate(postEnd) &&
    isDate(voteStart) &&
    isDate(voteEnd)
  ) {
    if (overlaps(postStart, postEnd, voteStart, voteEnd)) {
      messages.push(
        "書評投稿期間と書評投票期間が重複しています。期間を分けてください。",
      );
    }
  }

  // ----------------
  // サブ期間がイベント期間内に収まっているかの明示的チェック
  // ----------------
  if (isDate(start) && isDate(end)) {
    if (isDate(postStart) && isDate(postEnd)) {
      if (postStart < start || postEnd > end) {
        messages.push("書評投稿期間はイベント期間内に設定してください。");
      }
    }
    if (isDate(voteStart) && isDate(voteEnd)) {
      if (voteStart < start || voteEnd > end) {
        messages.push("書評投票期間はイベント期間内に設定してください。");
      }
    }
  }

  return messages.length > 0 ? messages : null;
}
