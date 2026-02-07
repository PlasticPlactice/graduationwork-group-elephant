"use client";

import { Icon } from "@iconify/react";
import {
  getEventProgressValue,
  getEventCircleClassName,
  getEventLabelClassName,
  isArrowVisible,
} from "@/lib/eventProgressUtils";

interface EventProgressBarProps {
  /**
   * イベントのステータス (0, 1, 2, 3)
   * 0: 開催前
   * 1: 一次審査中
   * 2: 二次審査中
   * 3: 終了済
   */
  status: number | string;

  /**
   * 進捗値のバリアント
   * 'compact': ホーム画面用 (11, 37, 63, 89)
   * 'full': イベント詳細画面用 (18, 39, 61, 83)
   * @default 'full'
   */
  variant?: "compact" | "full";

  /**
   * コンテナの幅（Tailwindクラス）
   * @default 'w-full'
   */
  width?: string;

  /**
   * ステータスラベルを表示するか
   * @default true
   */
  showLabels?: boolean;

  /**
   * コンテナの追加クラス
   */
  containerClassName?: string;

  /**
   * プログレスバーの追加クラス
   */
  progressClassName?: string;
}

export function EventProgressBar({
  status,
  variant = "full",
  width = "w-full",
  showLabels = true,
  containerClassName = "",
  progressClassName = "w-full h-0.5",
}: EventProgressBarProps) {
  const statusIndices = [0, 1, 2, 3];
  const labels = ["開催前", "一次審査", "二次審査", "終了済"];

  return (
    <div className={containerClassName}>
      {/* 矢印アイコン行 */}
      <div className={`flex justify-between ${width} m-auto`}>
        {statusIndices.map((index) => (
          <p key={`arrow-${index}`} className="w-10">
            {isArrowVisible(index, status) ? (
              <Icon
                icon="bxs:up-arrow"
                rotate={2}
                className="up-arrow m-auto"
              ></Icon>
            ) : (
              <Icon
                icon="material-symbols:circle"
                className="m-auto text-white"
              ></Icon>
            )}
          </p>
        ))}
      </div>

      {/* 円アイコン行 */}
      <div className={`flex justify-between ${width} m-auto`}>
        {statusIndices.map((index) => (
          <p key={`circle-${index}`} className="w-10">
            <Icon
              icon="material-symbols:circle"
              className={getEventCircleClassName(index, status)}
            ></Icon>
          </p>
        ))}
      </div>

      {/* プログレスバー */}
      <div className="flex justify-center mt-2">
        <progress
          max={200}
          value={getEventProgressValue(status, variant)}
          className={progressClassName}
        ></progress>
      </div>

      {/* ラベル行 */}
      {showLabels && (
        <div className={`flex justify-between ${width} m-auto`}>
          {labels.map((label, index) => (
            <span key={`label-${index}`} className={getEventLabelClassName(index, status)}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
