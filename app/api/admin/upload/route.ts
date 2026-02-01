import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

// ファイルアップロード設定
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
        { message: "ファイルサイズが制限を超えています (10MB)" },
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

    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "ファイルの内容が許可されていない形式です。" },
        { status: 400 },
      );
    }

    // アップロードディレクトリ作成
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // ファイル保存（一意のファイル名を生成）
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}${ext}`;
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
