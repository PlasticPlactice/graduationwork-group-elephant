import React from "react";
import { ListPageLayout } from "@/components/templates/ListPageLayout";

const newsItems = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  date: "2025-10-01",
  title: "第１回文庫Xが開催されました！",
  image: "/top/image.png",
}));

// TODO: 実際のデータとページネーションロジックを実装する
const totalPages = 5;
const currentPage = 1;

export default function NewsPage() {
  return (
    <ListPageLayout
      title="お知らせ一覧"
      items={newsItems}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
