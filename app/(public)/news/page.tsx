import React from "react";
import { ListPageLayout } from "@/components/templates/ListPageLayout";

interface ItemProps {
  id: number;
  date: string;
  title: string;
  image: string;
}

interface ApiResponse {
  data: ItemProps[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

async function getNewsData(page: number): Promise<ApiResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/notifications?type=0&page=${page}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error("Failed to fetch news data");
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const apiData = await getNewsData(currentPage);

  const newsItems = apiData?.data || [];
  const totalPages = apiData?.totalPages || 1;

  return (
    <ListPageLayout
      title="お知らせ一覧"
      items={newsItems}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
