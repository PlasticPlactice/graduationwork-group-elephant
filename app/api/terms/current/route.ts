import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CurrentTermsResponse } from "@/lib/types/terms";

// 1時間キャッシュ
export const revalidate = 3600;

/**
 * 現在公開中の利用規約を取得
 * GET /api/terms/current
 */
export async function GET() {
  try {
    // public_flag=true かつ deleted_flag=false の利用規約を取得
    const currentTerms = await prisma.terms.findFirst({
      where: {
        public_flag: true,
        deleted_flag: false,
      },
      orderBy: {
        applied_at: "desc",
      },
      select: {
        id: true,
        file_name: true,
        data_path: true,
        applied_at: true,
      },
    });

    if (!currentTerms) {
      const response: CurrentTermsResponse = {
        success: false,
        terms: null,
        message: "現在公開中の利用規約がありません。",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: CurrentTermsResponse = {
      success: true,
      terms: {
        id: currentTerms.id,
        file_name: currentTerms.file_name,
        data_path: currentTerms.data_path,
        applied_at: currentTerms.applied_at?.toISOString() || null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("利用規約取得エラー:", error);
    const response: CurrentTermsResponse = {
      success: false,
      terms: null,
      message: "利用規約の取得に失敗しました。",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
