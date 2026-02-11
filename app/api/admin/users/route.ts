import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { USER_STATUS } from "@/lib/constants/userStatus";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const PAGE_SIZE = 7;

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 管理者権限チェック
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // クエリパラメータを取得
    const searchParams = req.nextUrl.searchParams;
    // ページ番号バリデーション（最小値のみ。最大値は総件数取得後に検証可能）
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const sortBy = searchParams.get("sortBy") || "account_id";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const accountId = searchParams.get("account_id")?.trim() || "";
    const nickname = searchParams.get("nickname")?.trim() || "";
    const ageFrom = searchParams.get("ageFrom")
      ? parseInt(searchParams.get("ageFrom")!)
      : null;
    const ageTo = searchParams.get("ageTo")
      ? parseInt(searchParams.get("ageTo")!)
      : null;
    const prefecture = searchParams.get("prefecture")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const statusParam = searchParams.get("status");

    // where句の条件を動的に構築
    const where: Prisma.UserWhereInput = {};

    // アカウントID検索
    if (accountId) {
      where.account_id = {
        contains: accountId,
        mode: "insensitive",
      };
    }

    // ニックネーム検索
    if (nickname) {
      where.nickname = {
        contains: nickname,
        mode: "insensitive",
      };
    }

    // 年代検索（数値バリデーション）
    if (ageFrom !== null && isNaN(ageFrom)) {
      return NextResponse.json(
        { message: "Invalid ageFrom parameter" },
        { status: 400 },
      );
    }
    if (ageTo !== null && isNaN(ageTo)) {
      return NextResponse.json(
        { message: "Invalid ageTo parameter" },
        { status: 400 },
      );
    }

    if (ageFrom !== null && ageTo !== null) {
      where.age = {
        gte: ageFrom,
        lte: ageTo,
      };
    } else if (ageFrom !== null) {
      where.age = {
        gte: ageFrom,
      };
    } else if (ageTo !== null) {
      where.age = {
        lte: ageTo,
      };
    }

    // 都道府県検索
    if (prefecture) {
      where.address = prefecture;
    }

    // 市町村検索
    if (city) {
      where.sub_address = {
        contains: city,
        mode: "insensitive",
      };
    }

    // ステータス検索（削除フラグロジック）
    // statusParam は上部で取得済み
    if (statusParam === "all") {
      // 明示的に「すべて」が指定された場合は削除フラグ・ステータスで絞らない
    } else if (statusParam !== null && statusParam !== "") {
      const statusValue = parseInt(statusParam, 10);
      if (Number.isNaN(statusValue)) {
        return NextResponse.json(
          { message: "Invalid status parameter" },
          { status: 400 },
        );
      }
      where.user_status = statusValue;
      // ステータス 1（退会済み）または 2（アカウント停止）が選ばれた場合のみ削除済みを含める
      if (
        statusValue === USER_STATUS.WITHDRAWN ||
        statusValue === USER_STATUS.BAN
      ) {
        // deleted_flag の制約なし（削除済みも含む）
      } else {
        // ACTIVE等の他のステータスは削除済みを除外
        where.deleted_flag = false;
      }
    } else {
      // ステータス未選択の場合、削除済みは表示しない
      where.deleted_flag = false;
    }

    // ソート対象の有効なカラムを指定
    const validSortColumns = [
      "account_id",
      "nickname",
      "age",
      "address",
      "user_status",
    ];
    const finalSortBy = validSortColumns.includes(sortBy)
      ? sortBy
      : "account_id";
    const finalSortOrder = sortOrder === "desc" ? "desc" : "asc";

    // ページネーション
    const skip = (page - 1) * PAGE_SIZE;
    const take = PAGE_SIZE;

    // ユーザー一覧取得（書評数を含める）
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        account_id: true,
        nickname: true,
        age: true,
        address: true,
        user_status: true,
        deleted_flag: true,
        _count: {
          select: {
            bookReviews: true,
          },
        },
      },
      orderBy: {
        [finalSortBy]: finalSortOrder,
      },
      skip,
      take,
    });

    // 総件数取得
    const total = await prisma.user.count({ where });

    // レスポンスデータの整形
    const usersResponse = users.map((user) => ({
      id: user.id,
      account_id: user.account_id,
      nickname: user.nickname,
      age: user.age,
      address: user.address,
      status: user.user_status,
      reviewCount: user._count.bookReviews,
      deletedFlag: user.deleted_flag,
    }));

    return NextResponse.json({
      users: usersResponse,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
