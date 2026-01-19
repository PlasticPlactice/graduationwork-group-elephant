"use server";

import { redirect } from "next/navigation";

export async function preparePostConfirm(prevState: any, formData: FormData) {
  const html = formData.get("content");
  const id = crypto.randomUUID();

  
  redirect("/post/post-confirm");
}
