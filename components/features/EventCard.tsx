import React from "react";
import { Button } from "@/components/ui/button";
import "@/styles/components/event-card.css";

type EventCardProps = {
  title: string;
  daysLeft: number | string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  href?: string;
  isFinished?: boolean;
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  buttonTextColor?: string;
};

export const EventCard = ({
  title,
  daysLeft,
  description,
  buttonText = "投票へ",
  onButtonClick,
  isFinished = false,
  href = "/posts/bookshelf",
  buttonBackgroundColor,
  buttonBorderColor,
  buttonTextColor,
}: EventCardProps) => {
  // daysLeftが数値なら「日」をつける、それ以外（"終了"など）ならそのまま
  const timerDisplay =
    typeof daysLeft === "number" ? `${daysLeft}日` : daysLeft;

  return (
    <div
      className="event-card bg-white rounded-none p-6 shadow-sm"
      style={{
        border: isFinished
          ? "1px solid rgb(203, 213, 225)"
          : "2px solid var(--color-main)",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h4 className="text-xl font-bold text-slate-800 mb-2">{title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* タイマー部分のデザイン */}
        <div
          className="rounded px-3 py-2 text-center min-w-[100px]"
          style={{
            border: isFinished
              ? "1px solid rgb(203, 213, 225)"
              : "2px solid var(--color-main)",
          }}
        >
          <span className="block text-xs font-bold text-slate-600 mb-1">
            投票終了まで
            <br />
            あと
          </span>
          <span
            className={`block text-2xl font-bold ${
              isFinished ? "text-slate-400" : "text-red-500"
            }`}
          >
            {timerDisplay}
          </span>
        </div>
      </div>

      <div className="event-card__action">
        {href ? (
          // 内部リンクは next/link を使い、外部リンクは通常のアンカーで開く
          href.startsWith("http") ? (
            <a
              href={href}
              className="w-full inline-block font-bold py-3 text-center rounded"
              style={{
                backgroundColor:
                  buttonBackgroundColor ||
                  (isFinished
                    ? "var(--color-event-button-bg)"
                    : "var(--color-main)"),
                color: buttonTextColor || "var(--color-white)",
                border: buttonBorderColor
                  ? `2px solid ${buttonBorderColor}`
                  : "none",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {buttonText}
            </a>
          ) : (
            <Button
              href={href}
              className="w-full font-bold py-3 rounded"
              style={{
                backgroundColor:
                  buttonBackgroundColor ||
                  (isFinished
                    ? "var(--color-event-button-bg)"
                    : "var(--color-main)"),
                color: buttonTextColor || "var(--color-white)",
                border: buttonBorderColor
                  ? `2px solid ${buttonBorderColor}`
                  : "none",
              }}
            >
              {buttonText}
            </Button>
          )
        ) : (
          <Button
            className="w-full font-bold py-3 rounded"
            onClick={onButtonClick}
            style={{
              backgroundColor:
                buttonBackgroundColor ||
                (isFinished
                  ? "var(--color-event-button-bg)"
                  : "var(--color-main)"),
              color: buttonTextColor || "var(--color-white)",
              border: buttonBorderColor
                ? `2px solid ${buttonBorderColor}`
                : "none",
            }}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};
