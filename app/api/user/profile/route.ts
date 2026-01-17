import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const responseData = {
      nickName: user.nickname,
      address: user.address,
      addressDetail: user.sub_address,
      age: user.age,
      gender: user.gender, // 1:male, 2:female, 3:other
      introduction: user.self_introduction,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nickName, address, addressDetail, age, gender, introduction } =
      body;

    // 入力値の検証
    if (!nickName || !address) {
      return NextResponse.json(
        { message: "ニックネームと居住地は必須です" },
        { status: 400 }
      );
    }

    // age の検証
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 99) {
      return NextResponse.json(
        { message: "年齢の値が不正です" },
        { status: 400 }
      );
    }

    // gender の検証
    const parsedGender = parseInt(gender);
    if (![1, 2, 3].includes(parsedGender)) {
      return NextResponse.json(
        { message: "性別の値が不正です" },
        { status: 400 }
      );
    }

    // 岩手県選択時のaddressDetail必須チェック
    if (address === "岩手県" && !addressDetail) {
      return NextResponse.json(
        { message: "岩手県を選択した場合は、市区町村も選択してください" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        nickname: nickName,
        address: address,
        sub_address: addressDetail || "",
        age: parseInt(age),
        gender: parseInt(gender),
        self_introduction: introduction || "",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
