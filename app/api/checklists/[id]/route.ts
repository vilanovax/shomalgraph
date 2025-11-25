import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ChecklistTravelType, Season } from "@prisma/client";

// GET: دریافت چک‌لیست
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: "چک‌لیست یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی دسترسی
    if (checklist.userId !== session.user.id && !checklist.isShared) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // محاسبه درصد پیشرفت
    const allItems = await db.checklistItem.findMany({
      where: { checklistId: checklist.id },
      select: { isChecked: true },
    });

    const checkedCount = allItems.filter((item) => item.isChecked).length;
    const totalCount = allItems.length;
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...checklist,
        progress: Math.round(progress),
        checkedCount,
        totalCount,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت چک‌لیست" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش چک‌لیست
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // بررسی دسترسی
    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: "چک‌لیست یافت نشد" },
        { status: 404 }
      );
    }

    if (checklist.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { title, description, notes, travelType, season, isShared } = body;

    console.log("Update request body:", { title, description, notes, travelType, season, isShared });

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) {
      // تبدیل رشته خالی به null
      updateData.notes = notes === "" || notes === null ? null : notes;
    }
    if (travelType !== undefined)
      updateData.travelType = travelType as ChecklistTravelType;
    if (season !== undefined) updateData.season = season as Season;
    if (isShared !== undefined) updateData.isShared = isShared;

    console.log("Update data:", updateData);

    // بررسی اینکه آیا داده‌ای برای به‌روزرسانی وجود دارد
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "هیچ داده‌ای برای به‌روزرسانی ارسال نشده است" },
        { status: 400 }
      );
    }

    const updatedChecklist = await db.travelChecklist.update({
      where: { id },
      data: updateData,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedChecklist,
      message: "چک‌لیست با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating checklist:", error);
    const errorMessage =
      error instanceof Error ? error.message : "خطا در به‌روزرسانی چک‌لیست";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: حذف چک‌لیست
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // بررسی دسترسی
    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: "چک‌لیست یافت نشد" },
        { status: 404 }
      );
    }

    if (checklist.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    await db.travelChecklist.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "چک‌لیست با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting checklist:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف چک‌لیست" },
      { status: 500 }
    );
  }
}

