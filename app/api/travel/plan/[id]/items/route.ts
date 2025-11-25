import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { PlanItemType, TimeSlot } from "@prisma/client";

// GET: دریافت آیتم‌های برنامه
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

    const plan = await db.travelPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "برنامه یافت نشد" },
        { status: 404 }
      );
    }

    if (plan.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const items = await db.travelPlanItem.findMany({
      where: { planId: id },
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
      orderBy: [
        { dayNumber: "asc" },
        { order: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: unknown) {
    console.error("Error fetching plan items:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت آیتم‌ها" },
      { status: 500 }
    );
  }
}

// POST: اضافه کردن آیتم به برنامه
export async function POST(
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

    const {
      restaurantId,
      placeId,
      order,
      dayNumber,
      timeSlot,
      scheduledTime,
      duration,
      notes,
      tips,
    } = body;

    if (!restaurantId && !placeId) {
      return NextResponse.json(
        { success: false, error: "باید رستوران یا مکان انتخاب شود" },
        { status: 400 }
      );
    }

    // بررسی دسترسی
    const plan = await db.travelPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "برنامه یافت نشد" },
        { status: 404 }
      );
    }

    if (plan.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // تعیین order اگر داده نشده باشد
    let finalOrder = order;
    if (!finalOrder) {
      const maxOrder = await db.travelPlanItem.findFirst({
        where: { planId: id, dayNumber: dayNumber || null },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    const item = await db.travelPlanItem.create({
      data: {
        planId: id,
        order: finalOrder,
        dayNumber: dayNumber || null,
        timeSlot: timeSlot ? (timeSlot as TimeSlot) : null,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        duration: duration || 60,
        itemType: restaurantId
          ? ("RESTAURANT" as PlanItemType)
          : ("PLACE" as PlanItemType),
        restaurantId: restaurantId || null,
        placeId: placeId || null,
        notes: notes || null,
        tips: tips || null,
      },
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
      data: item,
      message: "آیتم با موفقیت اضافه شد",
    });
  } catch (error: unknown) {
    console.error("Error adding plan item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در اضافه کردن آیتم" },
      { status: 500 }
    );
  }
}

