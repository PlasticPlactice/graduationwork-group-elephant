export const TERM_STATUS = {
  APPLY: 0,
  NOT_APPLY: 1,
} as const;

export const TERM_STATUS_LABELS: Record<number, string> = {
  0: "適用中",
  1: "未適用",
};

export const TERM_STATUS_CLASS: Record<number, string> = {
  0: "apply",
  1: "not-apply",
};
