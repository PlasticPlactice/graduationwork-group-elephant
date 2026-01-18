import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';


// 一覧取得
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');

    const where: Prisma.EventWhereInput = { public_flag: true, deleted_flag: false };

    if (statusParam !== null) {
      // special keyword "now" -> [0,1,2]
      if (statusParam === 'now') {
        where.status = { in: [0, 1, 2] } as Prisma.IntFilter;
      } else {
        // allow comma-separated list like "0,1,2" or single number "1"
        const parts = statusParam.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
        if (parts.length === 1) {
          where.status = parts[0];
        } else if (parts.length > 1) {
          where.status = { in: parts } as Prisma.IntFilter;
        }
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { start_period: 'desc' },
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
    return NextResponse.json({ error: 'Server error', detail: (err as Error).message }, { status: 500 });
  }
}

// 登録処理
// todo:バリデーションチェック
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      'title',// イベントタイトル
      'start_period',// イベント開始日時
      'end_period',// イベント終了日時
      'first_voting_start_period',// 一次審査開始日時
      'first_voting_end_period',// 一次審査終了日時
      'second_voting_start_period',// 二次審査開始日時
      'second_voting_end_period',// 二次審査終了日時
    ];
    for (const k of required) {
      if (!body[k]) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

    // イベント開始日時がイベント終了日時より後の場合エラー⇒「イベント開始日時よりイベント終了日時の方が早いです。」とアラートで表示する
    // 一次審査開始日時が一次審査終了日時より後の場合エラー⇒「一次審査開始日時より一次審査終了日時の方が早いです。」とアラートで表示する
    // 二次審査開始日時が二次審査終了日時より後の場合エラー⇒「二次審査開始日時より二次審査終了日時の方が早いです。」とアラートで表示する
    const created = await prisma.event.create({
      data: {
        title: body.title,
        detail: body.detail ?? null,
        status: typeof body.status === 'number' ? body.status : 0,
        start_period: new Date(body.start_period),
        end_period: new Date(body.end_period),
        first_voting_start_period: new Date(body.first_voting_start_period),
        first_voting_end_period: new Date(body.first_voting_end_period),
        second_voting_start_period: new Date(body.second_voting_start_period),
        second_voting_end_period: new Date(body.second_voting_end_period),
        public_flag: Boolean(body.public_flag ?? true),
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: (err as Error).message }, { status: 500 });
  }
}
// 更新処理
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updateData: Prisma.EventUpdateInput = {};
    if ('title' in body) updateData.title = body.title;
    if ('detail' in body) updateData.detail = body.detail;
    if ('start_period' in body && body.start_period) updateData.start_period = new Date(body.start_period);
    if ('end_period' in body && body.end_period) updateData.end_period = new Date(body.end_period);
    if ('first_voting_start_period' in body && body.first_voting_start_period) updateData.first_voting_start_period = new Date(body.first_voting_start_period);
    if ('first_voting_end_period' in body && body.first_voting_end_period) updateData.first_voting_end_period = new Date(body.first_voting_end_period);
    if ('second_voting_start_period' in body && body.second_voting_start_period) updateData.second_voting_start_period = new Date(body.second_voting_start_period);
    if ('second_voting_end_period' in body && body.second_voting_end_period) updateData.second_voting_end_period = new Date(body.second_voting_end_period);
    if ('public_flag' in body) updateData.public_flag = Boolean(body.public_flag);
    if ('status' in body) updateData.status = Number(body.status);

    const updated = await prisma.event.update({
      where: { id: Number(body.id) },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: (err as Error).message }, { status: 500 });
  }
}
