import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// ファイルアップロード設定
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const ALLOWED_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_DOCUMENT_EXTENSIONS,
];

/**
 * POST /api/admin/upload
 * 管理者用: ファイルをアップロードし、DBに記録する
 */
export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  // 認証チェック
  if (!user?.id || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "ファイルがありません" },
        { status: 400 },
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
        {
          message: `許可されていないファイル形式です。許可されている形式: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // MIMEタイプの検証（拡張子偽装対策）
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    // 空のMIMEタイプを拒否（セキュリティ強化）
    if (!file.type) {
      return NextResponse.json(
        { message: "ファイルタイプが不明です" },
        { status: 400 },
      );
    }

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "ファイルの内容が許可されていない形式です。" },
        { status: 400 },
      );
    }

    // ファイル内容を取得してマジックナンバー検証
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDFファイルのマジックナンバー検証
    if (ext === ".pdf") {
      const pdfMagic = buffer.slice(0, 5).toString();
      if (pdfMagic !== "%PDF-") {
        return NextResponse.json(
          { message: "PDFファイルとして無効です" },
          { status: 400 },
        );
      }
    }

    // アップロードディレクトリ（環境変数で切り替え可能）
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // ファイル保存（UUID v4で確実に一意のファイル名を生成）
    const uuid = randomUUID();
    const filename = `${uuid}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    // ファイル名のサニタイズ（安全な文字のみ保持）
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");

    // ファイル情報をDBに保存
    const newFile = await prisma.file.create({
      data: {
        name: sanitizedOriginalName,
        data_path: `/uploads/${filename}`,
        type: file.type || "application/octet-stream",
      },
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "ファイルアップロード中にエラーが発生しました";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
