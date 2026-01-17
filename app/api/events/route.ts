import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        public_flag: Boolean(body.public_flag ?? false),
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: (err as Error).message }, { status: 500 });
  }
}
