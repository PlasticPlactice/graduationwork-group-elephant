export const USER_STATUS = {
  ACTIVE: 0,
  WITHDRAWN: 1,
  BAN: 2,
} as const;

export const USER_STATUS_LABELS: Record<number, string> = {
  0: "利用中",
  1: "退会済み",
  2: "BAN",
};

export const USER_STATUS_CLASS: Record<number, string> = {
  0: "active",
  1: "disable",
  2: "ban",
};
