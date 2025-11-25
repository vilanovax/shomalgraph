import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { TimeSlot } from "@prisma/client";

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
    const plan = await db.travelPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!plan || plan.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const {
      order,
      dayNumber,
      timeSlot,
      scheduledTime,
      duration,
      notes,
      tips,
      isCompleted,
    } = body;

    const updateData: any = {};

    if (order !== undefined) updateData.order = order;
    if (dayNumber !== undefined) updateData.dayNumber = dayNumber;
    if (timeSlot !== undefined)
      updateData.timeSlot = timeSlot ? (timeSlot as TimeSlot) : null;
    if (scheduledTime !== undefined)
      updateData.scheduledTime = scheduledTime
        ? new Date(scheduledTime)
        : null;
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (tips !== undefined) updateData.tips = tips;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const updatedItem = await db.travelPlanItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        restaurant: {
          include: {
            category: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
        place: {
          include: {
            category: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "آیتم با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating plan item:", error);
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
    const plan = await db.travelPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!plan || plan.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    await db.travelPlanItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting plan item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}

