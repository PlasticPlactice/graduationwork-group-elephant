import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  // `searchParams` may be a Promise in some Next.js streaming scenarios — unwrap safely
  const params =
    typeof (searchParams as Promise<{ error?: string }>)?.then === "function"
      ? await (searchParams as Promise<{ error?: string }>)
      : (searchParams as { error?: string } | undefined);

  const error = params?.error ?? "";
  const target = `/poster/login${error ? `?error=${encodeURIComponent(error)}` : ""}`;
  redirect(target);
}
