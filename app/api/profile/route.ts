import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت اطلاعات پروفایل کاربر
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات پروفایل" },
      { status: 500 }
    );
  }
}

// PUT: به‌روزرسانی پروفایل کاربر
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar } = body;

    console.log("Profile update request:", { name, avatar });

    const updateData: {
      name?: string;
      avatar?: string | null;
    } = {};

    if (name !== undefined) {
      updateData.name = name || null;
    }

    if (avatar !== undefined) {
      // اگر رشته خالی است، null ذخیره می‌شود
      updateData.avatar = avatar && avatar.trim() !== "" ? avatar.trim() : null;
    }

    console.log("Update data:", updateData);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("Updated user:", updatedUser);

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "پروفایل با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی پروفایل" },
      { status: 500 }
    );
  }
}

