/**
 * イベント進捗バーの進捗値を計算する関数
 * @param status イベントのステータス (0, 1, 2, 3)
 * @param variant 進捗値のパターン ('compact' = 11,37,63,89 / 'full' = 18,39,61,83)
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
      0: 11,
      1: 37,
      2: 63,
      3: 89,
    },
    full: {
      0: 18,
      1: 39,
      2: 61,
      3: 83,
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
  return index <= statusNumber
    ? "event-condition-circle-now"
    : "event-condition-circle-future";
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
