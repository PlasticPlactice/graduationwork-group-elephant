export const REVIEW_STATUS = {
  BEFORE: 0,
  FIRST_PASS: 1,
  SECOND_PASS: 2,
  THIRD_PASS: 3,
} as const;

export const REVIEW_STATUS_LABELS: Record<number, string> = {
  [REVIEW_STATUS.BEFORE]: "評価前",
  [REVIEW_STATUS.FIRST_PASS]: "一次通過",
  [REVIEW_STATUS.SECOND_PASS]: "二次通過",
  [REVIEW_STATUS.THIRD_PASS]: "三次通過",
};
