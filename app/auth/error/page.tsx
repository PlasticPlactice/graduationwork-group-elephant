import { redirect } from "next/navigation";

export default function Page({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error ?? "";
  const target = `/poster/login${error ? `?error=${encodeURIComponent(error)}` : ""}`;
  redirect(target);
}
