import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت برنامه
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
      include: {
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
                _count: {
                  select: {
                    reviews: true,
                    favorites: true,
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
                    favorites: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { dayNumber: "asc" },
            { order: "asc" },
          ],
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "برنامه یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی دسترسی
    if (plan.userId !== session.user.id && !plan.isShared) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error: unknown) {
    console.error("Error fetching travel plan:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت برنامه" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش برنامه
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

    const {
      title,
      description,
      status,
      isShared,
      startDate,
      endDate,
      startTime,
      endTime,
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (isShared !== undefined) updateData.isShared = isShared;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    const updatedPlan = await db.travelPlan.update({
      where: { id },
      data: updateData,
      include: {
        items: {
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: "برنامه با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating travel plan:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی برنامه" },
      { status: 500 }
    );
  }
}

// DELETE: حذف برنامه
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

    await db.travelPlan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "برنامه با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting travel plan:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف برنامه" },
      { status: 500 }
    );
  }
}

