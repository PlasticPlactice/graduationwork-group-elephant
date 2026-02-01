import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// アカウントID生成関数 (10桁の数字)
function generateAccountId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// ユーザーIDを一意に生成するヘルパー関数（リトライ戦略を使用）
async function createUniqueAccountId(maxAttempts: number = 10) {
  let accountId = "";
  let attempts = 0;

  while (attempts < maxAttempts) {
    accountId = generateAccountId();
    attempts++;

    // 存在チェック（簡易的）
    const existingUser = await prisma.user.findUnique({
      where: { account_id: accountId },
    });

    if (!existingUser) {
      return accountId;
    }
  }

  throw new Error(
    "Failed to generate unique account ID after maximum attempts"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nickname,
      password, // ユーザーが入力したパスワード
      address, // 都道府県
      sub_address, // 市区町村 (岩手の場合)
      age,
      gender,
      self_introduction,
      color,
    } = body;

    // バリデーション (簡易)
    if (!nickname || !password || !address || !age || !gender) {
      return NextResponse.json(
        { message: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // パスワード強度チェック（サーバー側）
    const passwordComplexityRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

    if (
      typeof password !== "string" ||
      !passwordComplexityRegex.test(password)
    ) {
      return NextResponse.json(
        {
          message:
            "パスワードは8文字以上で、英字・数字・記号をそれぞれ1文字以上含めてください",
        },
        { status: 400 }
      );
    }

    // 岩手県選択時のsub_address必須チェック
    if (address === "岩手県" && !sub_address) {
      return NextResponse.json(
        { message: "岩手県を選択した場合は、市区町村も選択してください" },
        { status: 400 }
      );
    }

    // アカウントIDとパスワードの生成
    const accountId = await createUniqueAccountId();
    // パスワードはユーザー入力を採用
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const newUser = await prisma.user.create({
      data: {
        account_id: accountId,
        password: hashedPassword,
        nickname,
        address,
        sub_address: sub_address || "", // 未選択の場合は空文字
        age: parseInt(age),
        gender: gender === "male" ? 1 : gender === "female" ? 2 : 3, // 1:男性, 2:女性, 3:その他
        self_introduction: self_introduction || "",
        color: color || "#D1D5DB",
        pattern: "default", // デフォルト値
        pattern_color: "#FFFFFF", // デフォルト値
        user_status: 0,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "ユーザー登録完了",
        user: {
          accountId: newUser.account_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  }
}
