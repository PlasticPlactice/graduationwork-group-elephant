import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// ファイルアップロード設定
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = [".pdf"];

/**
 * GET /api/admin/terms
 * 管理者用: 利用規約一覧または詳細を取得
 */
export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const publicOnly = searchParams.get("public") === "true";

    if (id) {
      // 詳細取得
      const term = await prisma.terms.findUnique({
        where: { id: parseInt(id) },
        include: {
          admin: {
            select: { id: true, email: true },
          },
        },
      });

      if (!term || term.deleted_flag) {
        return NextResponse.json(
          { message: "利用規約が見つかりません" },
          { status: 404 },
        );
      }

      return NextResponse.json(term);
    }

    // 一覧取得
    const where: {
      deleted_flag: boolean;
      public_flag?: boolean;
    } = {
      deleted_flag: false,
    };

    if (publicOnly) {
      where.public_flag = true;
    }

    const terms = await prisma.terms.findMany({
      where,
      include: {
        admin: {
          select: { id: true, email: true },
        },
      },
      orderBy: [{ created_at: "desc" }, { id: "asc" }],
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { message: "利用規約の取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/terms
 * 管理者用: 利用規約をアップロードして登録
 */
export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  console.log("=== POST /api/admin/terms ===");
  console.log("Session:", session);
  console.log("User:", user);

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const mode = formData.get("mode") as string | null;
    const dateTimeValue = formData.get("dateTimeValue") as string | null;

    // バリデーション
    if (!file) {
      return NextResponse.json(
        { message: "ファイルが必要です" },
        { status: 400 },
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { message: "ファイル名が必要です" },
        { status: 400 },
      );
    }

    if (!mode || (mode !== "datetime" && mode !== "immediate")) {
      return NextResponse.json(
        { message: "適用モード（datetime/immediate）が必要です" },
        { status: 400 },
      );
    }

    // 管理者が存在するか確認
    const adminId = parseInt(user.id);
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      console.error(`Admin not found: id=${adminId}`);
      return NextResponse.json(
        { message: "管理者アカウントが見つかりません" },
        { status: 401 },
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "ファイルサイズが制限を超えています (20MB)" },
        { status: 413 },
      );
    }

    // ファイル拡張子チェック
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { message: "PDFファイルのみアップロード可能です" },
        { status: 400 },
      );
    }

    // MIMEタイプの検証（セキュリティ強化）
    if (!file.type) {
      return NextResponse.json(
        { message: "ファイルタイプが不明です" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "PDFファイルのみアップロード可能です" },
        { status: 400 },
      );
    }

    // ファイル内容を取得してマジックナンバー検証
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    const pdfMagic = pdfBuffer.slice(0, 5).toString();

    if (pdfMagic !== "%PDF-") {
      return NextResponse.json(
        { message: "PDFファイルとして無効です（ファイル内容が不正）" },
        { status: 400 },
      );
    }

    // ファイルシステムに保存（環境変数で切り替え可能）
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uuid = randomUUID();
    const saveFileName = `${uuid}.pdf`;
    const dataPath = `/uploads/${saveFileName}`;
    const fullPath = path.join(uploadDir, saveFileName);

    await fs.writeFile(fullPath, pdfBuffer);

    // 日時の処理
    const now = new Date();
    let appliedAt: Date | null = null;
    let scheduledAppliedAt: Date | null = null;

    if (mode === "immediate") {
      appliedAt = now;
    } else if (mode === "datetime" && dateTimeValue) {
      scheduledAppliedAt = new Date(dateTimeValue);
      // 予約時間が過去でないかチェック
      if (scheduledAppliedAt <= now) {
        return NextResponse.json(
          { message: "予約日時は現在時刻より後に設定してください" },
          { status: 400 },
        );
      }
    }

    // トランザクション: 既存公開中の規約を非公開 → 新規登録
    const newTerm = await prisma.$transaction(async (tx) => {
      // 既存の public_flag=true を false に更新
      if (mode === "immediate") {
        await tx.terms.updateMany({
          where: {
            public_flag: true,
            deleted_flag: false,
          },
          data: {
            public_flag: false,
            updated_at: now,
          },
        });
      }

      // 新規利用規約を登録
      return await tx.terms.create({
        data: {
          file_name: fileName,
          data_path: dataPath,
          public_flag: mode === "immediate",
          admin_id: adminId,
          applied_at: appliedAt,
          scheduled_applied_at: scheduledAppliedAt,
        },
      });
    });

    return NextResponse.json(newTerm, { status: 201 });
  } catch (error) {
    console.error("Error creating term:", error);

    // ファイルシステムのエラー時は、DBには登録しないようにしているため、
    // ここでエラーを返すことで整合性を保つ
    return NextResponse.json(
      { message: "利用規約の登録に失敗しました" },
      { status: 500 },
    );
  }
}
