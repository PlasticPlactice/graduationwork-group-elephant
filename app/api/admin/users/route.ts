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
      "reviewCount",
    ];
    const finalSortBy = validSortColumns.includes(sortBy)
      ? sortBy
      : "account_id";
    const finalSortOrder = sortOrder === "desc" ? "desc" : "asc";

    // ページネーション
    const skip = (page - 1) * PAGE_SIZE;
    const take = PAGE_SIZE;

    // 共通型: DBから取得するユーザー行の型
    type UserRow = {
      id: number;
      account_id: string;
      nickname: string;
      age: number;
      address: string;
      user_status: number;
      deleted_flag: boolean;
    };

    // 共通ヘルパー: 与えられた userId 配列から書評数の Map を返す
    const fetchCountsFor = async (userIds: number[]) => {
      if (userIds.length === 0) return new Map<number, number>();
      const counts = await prisma.bookReview.groupBy({
        by: ["user_id"],
        where: { user_id: { in: userIds } },
        _count: { _all: true },
      });
      const map = new Map<number, number>();
      counts.forEach((c) => map.set(c.user_id, c._count._all));
      return map;
    };

    // 共通ヘルパー: User レコード配列と countMap からレスポンス形式に整形
    const formatUsers = (rows: UserRow[], countMap: Map<number, number>) =>
      rows.map((user) => ({
        id: user.id,
        account_id: user.account_id,
        nickname: user.nickname,
        age: user.age,
        address: user.address,
        status: user.user_status,
        reviewCount: countMap.get(user.id) ?? 0,
        deletedFlag: user.deleted_flag,
      }));

    // reviewCount ソートは集計してメモリ内ソート・ページング
    if (finalSortBy === "reviewCount") {
      const allUsers: UserRow[] = await prisma.user.findMany({
        where,
        select: {
          id: true,
          account_id: true,
          nickname: true,
          age: true,
          address: true,
          user_status: true,
          deleted_flag: true,
        },
      });

      const countMap = await fetchCountsFor(allUsers.map((u) => u.id));

      const usersWithCount = allUsers.map((u) => ({
        ...u,
        reviewCount: countMap.get(u.id) ?? 0,
      }));

      usersWithCount.sort((a, b) => {
        if (a.reviewCount === b.reviewCount) return a.id - b.id;
        return finalSortOrder === "asc"
          ? a.reviewCount - b.reviewCount
          : b.reviewCount - a.reviewCount;
      });

      const paged = usersWithCount.slice(skip, skip + take);
      const total = await prisma.user.count({ where });
      const usersResponse = formatUsers(paged, countMap);

      return NextResponse.json({
        users: usersResponse,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      });
    }

    // 通常ソート: DB でページングしてから書評数を取得してマージ
    const orderBy: Prisma.UserOrderByWithRelationInput[] = [
      { [finalSortBy]: finalSortOrder } as Prisma.UserOrderByWithRelationInput,
      { id: "asc" } as Prisma.UserOrderByWithRelationInput,
    ];

    const rows: UserRow[] = await prisma.user.findMany({
      where,
      select: {
        id: true,
        account_id: true,
        nickname: true,
        age: true,
        address: true,
        user_status: true,
        deleted_flag: true,
      },
      orderBy,
      skip,
      take,
    });

    const total = await prisma.user.count({ where });
    const countMap = await fetchCountsFor(rows.map((r) => r.id));
    const usersResponse = formatUsers(rows, countMap);

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
