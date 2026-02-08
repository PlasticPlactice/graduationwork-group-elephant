/**
 * イベントステータスの定数定義
 */
export const EVENT_STATUS = {
  /** 0: イベント作成時（非公開） */
  BEFORE_START: 0,
  /** 1: 投稿期間（start_period & first_voting_start_period 到達後） */
  POSTING: 1,
  /** 2: 審査期間（first_voting_end_period 到達後） */
  FIRST_REVIEW: 2,
  /** 3: 投票期間（second_voting_start_period 到達後） */
  VOTING: 3,
  /** 4: 閲覧期間（second_voting_end_period 到達後） */
  VIEWING: 4,
  /** 5: イベント終了（end_period 到達後、非公開） */
  ENDED: 5,
} as const;

/**
 * イベントステータスのラベル
 */
export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.BEFORE_START]: "開催前",
  [EVENT_STATUS.POSTING]: "投稿期間",
  [EVENT_STATUS.FIRST_REVIEW]: "審査期間",
  [EVENT_STATUS.VOTING]: "投票期間",
  [EVENT_STATUS.VIEWING]: "閲覧期間",
  [EVENT_STATUS.ENDED]: "終了済",
} as const;

/**
 * public_flag を自動制御すべきステータス
 * - ステータス 0, 5 では false (非公開)
 * - ステータス 1, 2, 3, 4 では true (公開)
 */
export const EVENT_PUBLIC_STATUSES = [
  EVENT_STATUS.POSTING,
  EVENT_STATUS.FIRST_REVIEW,
  EVENT_STATUS.VOTING,
  EVENT_STATUS.VIEWING,
] as const;

/**
 * ステータスが公開状態かどうかを判定
 */
export function isPublicStatus(status: number): boolean {
  return (EVENT_PUBLIC_STATUSES as readonly number[]).includes(status);
}

/**
 * 日時ベースでイベントステータスを計算
 */
export function calculateEventStatus(dates: {
  start_period: Date;
  end_period: Date;
  first_voting_start_period: Date;
  first_voting_end_period: Date;
  second_voting_start_period: Date;
  second_voting_end_period: Date;
}): number {
  const now = new Date();

  // 0: イベント開始前（start_period と first_voting_start_period の両方が未到達）
  if (now < dates.start_period || now < dates.first_voting_start_period) {
    return EVENT_STATUS.BEFORE_START;
  }

  // 1: 投稿期間（first_voting_end_period 未到達）
  if (now < dates.first_voting_end_period) {
    return EVENT_STATUS.POSTING;
  }

  // 2: 審査期間（second_voting_start_period 未到達）
  if (now < dates.second_voting_start_period) {
    return EVENT_STATUS.FIRST_REVIEW;
  }

  // 3: 投票期間（second_voting_end_period 未到達）
  if (now < dates.second_voting_end_period) {
    return EVENT_STATUS.VOTING;
  }

  // 4: 閲覧期間（end_period 未到達）
  if (now < dates.end_period) {
    return EVENT_STATUS.VIEWING;
  }

  // 5: イベント終了
  return EVENT_STATUS.ENDED;
}
