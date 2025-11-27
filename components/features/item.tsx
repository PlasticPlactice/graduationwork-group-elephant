import Image from "next/image";
import "@/styles/components/item.css";

type ItemProps = {
  date: string;
  title: string;
  image: string;
  onClick?: () => void;
};

export const Item = ({ date, title, image, onClick }: ItemProps) => {
  return (
    <div className="item-container" onClick={onClick} onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    }} role="button" tabIndex={0}
    >
      <div className="item-image-wrapper">
        <Image src={image} alt={title} fill className="item-image" />
      </div>
      <div className="item-content">
        <p className="item-date">{date}</p>
        <h2 className="item-title">{title}</h2>
      </div>
    </div>
  );
};
