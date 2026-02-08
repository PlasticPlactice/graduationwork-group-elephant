/**
 * イベント進捗バーの進捗値を計算する関数
 * @param status イベントのステータス (0, 1, 2, 3)
 * @param variant 進捗値のパターン ('compact' = 24,75,125,179 / 'full' = 37,79,121,163)
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
      1: 75,
      2: 125,
      3: 179,
    },
    full: {
      0: 37,
      1: 79,
      2: 121,
      3: 163,
    },
  };

  return progressMaps[variant][statusNumber] ?? 0;
};

/**
 * ステータス円形アイコンのクラス名を取得する関数
 * @param index 円のインデックス (0, 1, 2, 3)
 * @param status イベントのステータス (0, 1, 2, 3)
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
 * @param index インデックス (0, 1, 2, 3)
 * @param status イベントのステータス (0, 1, 2, 3)
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
