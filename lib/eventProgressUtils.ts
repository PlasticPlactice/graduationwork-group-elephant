/**
 * イベント進捗バーの進捗値を計算する関数
 * @param status イベントのステータス (0, 1, 2, 3, 4, 5)
 * @param variant 進捗値のパターン ('compact' = 24,55,86,117,148,179 / 'full' = 37,62,87,113,138,163)
 * @returns 進捗バーに表示する値 (0-100)
 */
export const getEventProgressValue = (
  status: number | string,
  variant: "compact" | "full" = "full",
): number => {
  const statusNumber =
    typeof status === "string" ? parseInt(status, 10) : status;

  const progressMaps: Record<"compact" | "full", Record<number, number>> = {
    compact: {
      0: 24,
      1: 55,
      2: 86,
      3: 117,
      4: 148,
      5: 179,
    },
    full: {
      0: 37,
      1: 62,
      2: 87,
      3: 113,
      4: 138,
      5: 163,
    },
  };

  return progressMaps[variant][statusNumber] ?? 0;
};

/**
 * ステータス円形アイコンのクラス名を取得する関数
 * @param index 円のインデックス (0, 1, 2, 3, 4, 5)
 * @param status イベントのステータス (0, 1, 2, 3, 4, 5)
 * @returns CSSクラス名
 */
export const getEventCircleClassName = (
  index: number,
  status: number | string,
): string => {
  const statusNumber =
    typeof status === "string" ? parseInt(status, 10) : status;
  if (index < statusNumber) {
    return "event-condition-circle-past";
  } else if (index === statusNumber) {
    return "event-condition-circle-now";
  } else {
    return "event-condition-circle-future";
  }
};

export const getEventLabelClassName = (
  index: number,
  status: number | string,
): string => {
  const statusNumber =
    typeof status === "string" ? parseInt(status, 10) : status;
  if (index < statusNumber) {
    return "event-condition-label-past";
  } else if (index === statusNumber) {
    return "event-condition-label-now";
  } else {
    return "event-condition-label-future";
  }
};

/**
 * ステータス矢印アイコンが表示されるべき位置を判定する関数
 * @param index インデックス (0, 1, 2, 3, 4, 5)
 * @param status イベントのステータス (0, 1, 2, 3, 4, 5)
 * @returns 矢印を表示すべきかどうか
 */
export const isArrowVisible = (
  index: number,
  status: number | string,
): boolean => {
  const statusNumber =
    typeof status === "string" ? parseInt(status, 10) : status;
  return statusNumber === index;
};
