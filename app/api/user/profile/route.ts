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
