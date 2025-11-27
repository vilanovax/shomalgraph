import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT: ویرایش کلمه بد
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { word, severity, isActive } = body;

    const updateData: {
      word?: string;
      severity?: "MILD" | "SEVERE";
      isActive?: boolean;
    } = {};

    if (word !== undefined) {
      updateData.word = word.trim().toLowerCase();
    }
    if (severity !== undefined) {
      updateData.severity = severity as "MILD" | "SEVERE";
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const badWord = await db.badWord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: badWord,
      message: "کلمه با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating bad word:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی کلمه" },
      { status: 500 }
    );
  }
}

// DELETE: حذف کلمه بد
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await db.badWord.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "کلمه با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting bad word:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف کلمه" },
      { status: 500 }
    );
  }
}

