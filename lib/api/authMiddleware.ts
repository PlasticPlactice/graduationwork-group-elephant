import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export interface AuthResult {
  user: {
    id?: string;
    role?: string;
  };
  session: {
    user?: {
      id?: string;
      role?: string;
    };
  } | null;
}

/**
 * 管理者認証チェック
 * @returns Promise<AuthResult または NextResponse（エラーの場合）>
 */
export async function requireAdminAuth(): Promise<
  AuthResult | NextResponse<{ message: string }>
> {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return { user, session };
}

/**
 * ユーザー認証チェック（admin/user 両方を許可）
 * @returns Promise<AuthResult または NextResponse（エラーの場合）>
 */
export async function requireUserAuth(): Promise<
  AuthResult | NextResponse<{ message: string }>
> {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return { user, session };
}

/**
 * 管理者のみの認証チェック（role を厳密に確認）
 * @returns Promise<AuthResult または NextResponse（エラーの場合）>
 */
export async function requireAdminOnly(): Promise<
  AuthResult | NextResponse<{ message: string }>
> {
  const result = await requireAdminAuth();

  if (result instanceof NextResponse) {
    return result;
  }

  if (result.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return result;
}
