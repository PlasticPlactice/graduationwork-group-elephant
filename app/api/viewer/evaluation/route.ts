import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

// 投票用の更新API
export async function PUT(req: Request) {
    try {
        const body = await req.json();

        if(!body.id) {
            return NextResponse.json(
                { message: "id is required" },
                { status: 400 }
            );
        }

        const updatedPost = await prisma.bookReview.update({
            where: { id: body.id },
            data: {
                evaluations_count: { increment: 1 }
            },
        });

        return NextResponse.json({ 
            message: "投票が完了しました！",
            count: updatedPost.evaluations_count
        });

    } catch (error) {
        return NextResponse.json(
            { message: "Failed to Update eval" },
            { status: 500 }
        )
    }
}
