import React from "react";

export const dynamic = "force-dynamic";

export default function Test500Page() {
  // 故意に例外を投げてアプリの error boundary を確認する
  throw new Error("intentional test 500");
}
