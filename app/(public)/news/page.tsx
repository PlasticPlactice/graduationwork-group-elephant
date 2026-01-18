import React from "react";
import { ListPageLayout } from "@/components/templates/ListPageLayout";
import { getNotificationData } from "@/lib/api/notifications";
import { NotificationType } from "@/lib/types/notification";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const apiData = await getNotificationData(NotificationType.NEWS, currentPage);

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
