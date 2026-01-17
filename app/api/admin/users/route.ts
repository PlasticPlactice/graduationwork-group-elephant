import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { USER_STATUS } from "@/lib/constants/userStatus";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 7;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 認証チェック
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 管理者権限チェック
  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // クエリパラメータを取得
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const id = searchParams.get("id")?.trim() || "";
    const nickname = searchParams.get("nickname")?.trim() || "";
    const ageFrom = searchParams.get("ageFrom")
      ? parseInt(searchParams.get("ageFrom")!)
      : null;
    const ageTo = searchParams.get("ageTo")
      ? parseInt(searchParams.get("ageTo")!)
      : null;
    const prefecture = searchParams.get("prefecture")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const status = searchParams.get("status")
      ? parseInt(searchParams.get("status")!)
      : null;

    // where句の条件を動的に構築
    const where: Prisma.UserWhereInput = {};

    // ID検索
    if (id) {
      where.id = parseInt(id);
    }

    // ニックネーム検索
    if (nickname) {
      where.nickname = {
        contains: nickname,
        mode: "insensitive",
      };
    }

    // 年代検索
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
    if (status !== null) {
      // ステータス 1（退会済み）または 2（BAN）が選ばれた場合
      if (status === USER_STATUS.WITHDRAWN || status === USER_STATUS.BAN) {
        where.OR = [
          { deleted_flag: false },
          { AND: [{ deleted_flag: true }, { user_status: status }] },
        ];
      } else {
        // その他のステータスは deleted_flag = false
        where.deleted_flag = false;
        where.user_status = status;
      }
    } else {
      // ステータス未選択の場合、削除済みは表示しない
      where.deleted_flag = false;
    }

    // ソート対象の有効なカラムを指定
    const validSortColumns = [
      "id",
      "nickname",
      "age",
      "address",
      "user_status",
    ];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : "id";
    const finalSortOrder = sortOrder === "desc" ? "desc" : "asc";

    // ページネーション
    const skip = (page - 1) * PAGE_SIZE;
    const take = PAGE_SIZE;

    // ユーザー一覧取得（書評数を含める）
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
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
