"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Item } from "@/components/features/item";
import { ItemModal } from "@/components/features/ItemModal";
import { Suspense } from "react";

interface ItemProps {
  id: number;
  date: string;
  title: string;
  image: string;
  content?: string;
  pdfUrl?: string;
}

interface ListPageLayoutProps {
  title: string;
  items: ItemProps[];
  currentPage: number;
  totalPages: number;
  backHref?: string;
}

export const ListPageLayout = ({
  title,
  items,
  currentPage,
  totalPages,
  backHref = "/",
}: ListPageLayoutProps) => {
  const [selectedItem, setSelectedItem] = useState<ItemProps | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleItemClick = (item: ItemProps) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div style={{ "--color-main": "#36A8B1" } as React.CSSProperties}>
      <div className="container mx-auto pt-8 px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            href={backHref}
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
        <h1
          className="text-2xl font-bold text-center tracking-widest mb-12"
          style={{ marginBottom: "56px" }}
        >
          {title}
        </h1>
        <div className="item-list max-w-6xl mx-auto">
          {items.map((item) => (
            <Item
              key={item.id}
              date={item.date}
              title={item.title}
              image={item.image}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
        <div className="item-pagination max-w-6xl mx-auto">
          <Suspense>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </Suspense>
        </div>
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};
