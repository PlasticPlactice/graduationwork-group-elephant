import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/admin/terms/[id]
 * 管理者用: 利用規約のメタデータを更新（ファイル自体は更新しない）
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { message: "ファイル名が必要です" },
        { status: 400 },
      );
    }

    // 対象の利用規約が存在するかチェック
    const term = await prisma.terms.findUnique({
      where: { id: numId },
    });

    if (!term || term.deleted_flag) {
      return NextResponse.json(
        { message: "利用規約が見つかりません" },
        { status: 404 },
      );
    }

    // 更新
    const updatedTerm = await prisma.terms.update({
      where: { id: numId },
      data: {
        file_name: fileName,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedTerm);
  } catch (error) {
    console.error("Error updating term:", error);
    return NextResponse.json(
      { message: "利用規約の更新に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/terms/[id]
 * 管理者用: 利用規約を論理削除
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const numId = parseInt(id);

    // 対象の利用規約が存在するかチェック
    const term = await prisma.terms.findUnique({
      where: { id: numId },
    });

    if (!term || term.deleted_flag) {
      return NextResponse.json(
        { message: "利用規約が見つかりません" },
        { status: 404 },
      );
    }

    // 論理削除
    const deletedTerm = await prisma.terms.update({
      where: { id: numId },
      data: {
        deleted_flag: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "利用規約が削除されました",
      data: deletedTerm,
    });
  } catch (error) {
    console.error("Error deleting term:", error);
    return NextResponse.json(
      { message: "利用規約の削除に失敗しました" },
      { status: 500 },
    );
  }
}
