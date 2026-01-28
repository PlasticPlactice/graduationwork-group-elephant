import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // middleware.ts で定義されているセッションクッキーを削除します
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );
}
