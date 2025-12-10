import React from "react";
import { ListPageLayout } from "@/components/templates/ListPageLayout";

const donationItems = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  date: "2025-10-01",
  title: "○○様よりご寄付をいただきました！",
  image: "/top/image.png",
}));

// TODO: 実際のデータとページネーションロジックを実装する
const totalPages = 5;
const currentPage = 1;

export default function DonationPage() {
  return (
    <ListPageLayout
      title="みなさまからの寄贈本"
      items={donationItems}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
