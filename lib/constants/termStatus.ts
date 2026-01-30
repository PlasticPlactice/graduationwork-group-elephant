export const TERM_STATUS = {
  APPLY: 0,
  APPLYEND: 1,
  BEFOREAPPLY: 2,
} as const;

export const TERM_STATUS_LABELS: Record<number, string> = {
  0: "適用中",
  1: "適用終了",
  2: "適用前",
};

export const TERM_STATUS_CLASS: Record<number, string> = {
  0: "apply",
  1: "applyend",
  2: "beforeapply",
};
