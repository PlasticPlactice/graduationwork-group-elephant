import React from "react";
import { ListPageLayout } from "@/components/templates/ListPageLayout";
import { getNotificationData } from "@/lib/api/notifications";
import { NotificationType } from "@/lib/types/notification";

export default async function DonationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const apiData = await getNotificationData(
    NotificationType.DONATION,
    currentPage,
  );

  const donationItems = apiData?.data || [];
  const totalPages = apiData?.totalPages || 1;

  return (
    <ListPageLayout
      title="みなさまからの寄贈本"
      items={donationItems}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
