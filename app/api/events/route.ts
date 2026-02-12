import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { validateEventDates } from "@/lib/validateEventDates";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

// 一覧取得
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const idParam = url.searchParams.get("id");

    const includePrivate = url.searchParams.get("include_private");

    const where: Prisma.EventWhereInput = {
      // by default only public and not deleted
      deleted_flag: false,
    };

    // include_private=true を要求された場合は管理者セッションを確認して公開フィルタを外す
    if (includePrivate !== "true") {
      where.public_flag = true;
    } else {
      // 管理者かどうかチェック
      const session = await getServerSession(authOptions as NextAuthOptions);
      const user = session?.user;
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // 管理者の場合は public_flag フィルタを付けない（非公開も含めて取得）
    }

    if (idParam) {
      where.id = Number(idParam);
    }

    if (statusParam !== null) {
      // special keyword "now" -> [0,1,2,3,4] (開催前から閲覧期間まで)
      if (statusParam === "now") {
        where.status = { in: [0, 1, 2, 3, 4] } as Prisma.IntFilter;
      } else {
        // allow comma-separated list like "0,1,2" or single number "1"
        const parts = statusParam
          .split(",")
          .map((s) => parseInt(s, 10))
          .filter((n) => !isNaN(n));
        if (parts.length === 1) {
          where.status = parts[0];
        } else if (parts.length > 1) {
          where.status = { in: parts } as Prisma.IntFilter;
        }
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [{ start_period: "desc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        detail: true,
        status: true,
        start_period: true,
        end_period: true,
        first_voting_start_period: true,
        first_voting_end_period: true,
        second_voting_start_period: true,
        second_voting_end_period: true,
        public_flag: true,
        created_at: true,
      },
    });
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", detail: (err as Error).message },
      { status: 500 },
    );
  }
}

// 登録処理
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      "title", // イベントタイトル
      "start_period", // イベント開始日時
      "end_period", // イベント終了日時
      "first_voting_start_period", // 一次審査開始日時
      "first_voting_end_period", // 一次審査終了日時
      "second_voting_start_period", // 二次審査開始日時
      "second_voting_end_period", // 二次審査終了日時
    ];
    for (const k of required) {
      if (!body[k]) {
        return NextResponse.json(
          { error: `${k} is required` },
          { status: 400 },
        );
      }
    }

    // 統一されたバリデーション関数を使用
    const err = validateEventDates({
      start_period: body.start_period,
      end_period: body.end_period,
      first_voting_start_period: body.first_voting_start_period,
      first_voting_end_period: body.first_voting_end_period,
      second_voting_start_period: body.second_voting_start_period,
      second_voting_end_period: body.second_voting_end_period,
    });
    if (err)
      return NextResponse.json(
        { error: Array.isArray(err) ? err.join("。\n") : err },
        { status: 400 },
      );

    const created = await prisma.event.create({
      data: {
        title: body.title,
        detail: body.detail ?? null,
        status: typeof body.status === "number" ? body.status : 0,
        start_period: new Date(body.start_period),
        end_period: new Date(body.end_period),
        first_voting_start_period: new Date(body.first_voting_start_period),
        first_voting_end_period: new Date(body.first_voting_end_period),
        second_voting_start_period: new Date(body.second_voting_start_period),
        second_voting_end_period: new Date(body.second_voting_end_period),
        public_flag:
          typeof body.public_flag === "boolean" ? body.public_flag : false,
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
// 更新処理
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id)
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    const id = Number(body.id);
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "event not found" }, { status: 404 });

    // 日付フィールドが更新される場合のみ検証（public_flag や status のみ更新時は不要）
    const hasDateFieldUpdate = [
      "start_period",
      "end_period",
      "first_voting_start_period",
      "first_voting_end_period",
      "second_voting_start_period",
      "second_voting_end_period",
    ].some((field) => field in body);

    if (hasDateFieldUpdate) {
      // マージして検証（body にある場合はそれを使い、なければ既存値を使う）
      const merged = {
        start_period: body.start_period ?? existing.start_period,
        end_period: body.end_period ?? existing.end_period,
        first_voting_start_period:
          body.first_voting_start_period ?? existing.first_voting_start_period,
        first_voting_end_period:
          body.first_voting_end_period ?? existing.first_voting_end_period,
        second_voting_start_period:
          body.second_voting_start_period ??
          existing.second_voting_start_period,
        second_voting_end_period:
          body.second_voting_end_period ?? existing.second_voting_end_period,
      };

      const err = validateEventDates(merged);
      if (err)
        return NextResponse.json(
          { error: Array.isArray(err) ? err.join("。\n") : err },
          { status: 400 },
        );
    }

    // 更新データ構築（body に含まれるものだけ変換して設定）
    const updateData: Prisma.EventUpdateInput = {};
    if ("title" in body) updateData.title = body.title;
    if ("detail" in body) updateData.detail = body.detail;
    if ("start_period" in body && body.start_period)
      updateData.start_period = new Date(body.start_period);
    if ("end_period" in body && body.end_period)
      updateData.end_period = new Date(body.end_period);
    if ("first_voting_start_period" in body && body.first_voting_start_period)
      updateData.first_voting_start_period = new Date(
        body.first_voting_start_period,
      );
    if ("first_voting_end_period" in body && body.first_voting_end_period)
      updateData.first_voting_end_period = new Date(
        body.first_voting_end_period,
      );
    if ("second_voting_start_period" in body && body.second_voting_start_period)
      updateData.second_voting_start_period = new Date(
        body.second_voting_start_period,
      );
    if ("second_voting_end_period" in body && body.second_voting_end_period)
      updateData.second_voting_end_period = new Date(
        body.second_voting_end_period,
      );
    if ("public_flag" in body)
      updateData.public_flag = Boolean(body.public_flag);
    if ("status" in body) updateData.status = Number(body.status);

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
