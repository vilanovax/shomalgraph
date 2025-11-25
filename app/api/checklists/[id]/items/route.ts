import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت آیتم‌های چک‌لیست
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

    const items = await db.checklistItem.findMany({
      where: { checklistId: id },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: unknown) {
    console.error("Error fetching checklist items:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت آیتم‌ها" },
      { status: 500 }
    );
  }
}

// POST: اضافه کردن آیتم به چک‌لیست
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

    const { name, description, order, isRequired, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "نام آیتم الزامی است" },
        { status: 400 }
      );
    }

    // تعیین order اگر داده نشده باشد
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await db.checklistItem.findFirst({
        where: { checklistId: id },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    const item = await db.checklistItem.create({
      data: {
        name,
        description: description || null,
        order: finalOrder,
        isRequired: isRequired || false,
        isChecked: false,
        notes: notes || null,
        checklistId: id,
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
      message: "آیتم با موفقیت اضافه شد",
    });
  } catch (error: unknown) {
    console.error("Error adding checklist item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در اضافه کردن آیتم" },
      { status: 500 }
    );
  }
}

