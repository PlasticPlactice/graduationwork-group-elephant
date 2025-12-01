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
};

export const EventCard = ({
  title,
  daysLeft,
  description,
  buttonText = "投票へ",
  onButtonClick,
  href = "/posts/bookshelf",
}: EventCardProps) => {
  return (
    <div className="event-card">
      <div className="event-card__header">
        <h4 className="event-card__title">{title}</h4>
        <div className="event-card__timer">
          <span className="timer-label">投票期間終了まであと</span>
          <span className="timer-days">{daysLeft}日</span>
        </div>
      </div>
      <p className="event-card__desc">{description}</p>
      <div className="event-card__action">
        <Button
          variant="outline"
          className="w-full event-card__button"
          onClick={onButtonClick}
          href={href}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
