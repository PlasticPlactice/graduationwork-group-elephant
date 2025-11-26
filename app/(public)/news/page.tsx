import React from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Item } from "@/components/features/item";

const newsItems = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  date: "2025-10-01",
  title: "第１回文庫Xが開催されました！",
  image: "/top/image.png",
}));

export default function NewsPage() {
  return (
    <div className="container mx-auto pt-8 px-4">
      <div className="mb-8">
        <Button
          variant="outline"
          href="/"
          className="h-5 shadow-md rounded-lg hover:bg-gray-50 text-xs"
          style={{
            width: "fit-content",
            color: "#FF4463",
            border: "1px solid #FF4463",
            backgroundColor: "#FFFFFF",
          }}
        >
          &lt; トップへ
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center tracking-widest mb-8">
        お知らせ一覧
      </h1>
      <div className="max-w-2xl mx-auto">
        {newsItems.map((item) => (
          <Item
            key={item.id}
            date={item.date}
            title={item.title}
            image={item.image}
          />
        ))}

        <Pagination />
      </div>
    </div>
  );
}
