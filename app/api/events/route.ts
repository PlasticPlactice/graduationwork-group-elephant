import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');

    const where: Prisma.EventWhereInput = { public_flag: true, deleted_flag: false };
    if (statusParam !== null) {
      const s = parseInt(statusParam, 10);
      if (!isNaN(s)) where.status = s;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      'title',
      'start_period',
      'end_period',
      'first_voting_start_period',
      'first_voting_end_period',
      'second_voting_start_period',
      'second_voting_end_period'
    ];
    for (const k of required) {
      if (!body[k]) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

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
