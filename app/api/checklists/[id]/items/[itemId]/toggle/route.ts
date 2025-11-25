import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST: چک/آنچک کردن آیتم
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; itemId: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;
    const body = await request.json();
    const { isChecked } = body;

    // بررسی دسترسی
    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      select: { userId: true, isShared: true },
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: "چک‌لیست یافت نشد" },
        { status: 404 }
      );
    }

    if (checklist.userId !== session.user.id && !checklist.isShared) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const item = await db.checklistItem.findUnique({
      where: { id: itemId },
      select: { checklistId: true },
    });

    if (!item || item.checklistId !== id) {
      return NextResponse.json(
        { success: false, error: "آیتم یافت نشد" },
        { status: 404 }
      );
    }

    const updatedItem = await db.checklistItem.update({
      where: { id: itemId },
      data: {
        isChecked: isChecked !== undefined ? isChecked : !item.isChecked,
      },
    });

    // محاسبه درصد پیشرفت
    const allItems = await db.checklistItem.findMany({
      where: { checklistId: id },
      select: { isChecked: true },
    });

    const checkedCount = allItems.filter((item) => item.isChecked).length;
    const totalCount = allItems.length;
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        item: updatedItem,
        progress: Math.round(progress),
        checkedCount,
        totalCount,
      },
    });
  } catch (error: unknown) {
    console.error("Error toggling checklist item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در تغییر وضعیت آیتم" },
      { status: 500 }
    );
  }
}

