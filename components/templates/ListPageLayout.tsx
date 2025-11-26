import React from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Item } from "@/components/features/item";

interface ItemProps {
  id: number;
  date: string;
  title: string;
  image: string;
}

interface ListPageLayoutProps {
  title: string;
  items: ItemProps[];
  currentPage: number;
  totalPages: number;
}

export const ListPageLayout = ({
  title,
  items,
  currentPage,
  totalPages,
}: ListPageLayoutProps) => {
  return (
    <div className="container mx-auto pt-8 px-4">
      <div className="mb-8">
        <Button
          variant="outline"
          href="/"
          className="h-5 shadow-md rounded-lg hover:bg-gray-50 text-xs"
          style={{
            width: "fit-content",
            color: "var(--color-main)",
            border: "1px solid var(--color-main)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          &lt; トップへ
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center tracking-widest mb-8">
        {title}
      </h1>
      <div className="max-w-2xl mx-auto">
        {items.map((item) => (
          <Item
            key={item.id}
            date={item.date}
            title={item.title}
            image={item.image}
          />
        ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
