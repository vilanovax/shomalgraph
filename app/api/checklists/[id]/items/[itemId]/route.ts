import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT: ویرایش آیتم
export async function PUT(
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

    // بررسی دسترسی
    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!checklist || checklist.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { name, description, order, isRequired, notes } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (notes !== undefined) updateData.notes = notes;

    const updatedItem = await db.checklistItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "آیتم با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی آیتم" },
      { status: 500 }
    );
  }
}

// DELETE: حذف آیتم
export async function DELETE(
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

    // بررسی دسترسی
    const checklist = await db.travelChecklist.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!checklist || checklist.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    await db.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}

