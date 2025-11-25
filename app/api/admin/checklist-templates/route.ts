import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ChecklistTravelType, Season } from "@prisma/client";

// GET: لیست قالب‌ها
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const templates = await db.travelChecklistTemplate.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: unknown) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت قالب‌ها" },
      { status: 500 }
    );
  }
}

// POST: ایجاد قالب جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // بررسی وجود کاربر در دیتابیس
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, icon, travelType, season, items } = body;

    console.log("Received data:", { title, travelType, season, itemsCount: items?.length });

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "عنوان الزامی است" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "حداقل یک آیتم الزامی است" },
        { status: 400 }
      );
    }

    // بررسی و پاکسازی آیتم‌ها
    const validItems = items.filter((item: { name?: string }) => item.name && item.name.trim());
    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "حداقل یک آیتم با نام معتبر الزامی است" },
        { status: 400 }
      );
    }

    // ایجاد قالب
    const template = await db.travelChecklistTemplate.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        travelType: travelType && travelType !== "none" ? (travelType as ChecklistTravelType) : null,
        season: season ? (season as Season) : null,
        isActive: true,
        createdById: user.id,
        items: {
          create: validItems.map((item: { name: string; description?: string; isRequired?: boolean; order?: number }, index: number) => ({
            name: item.name.trim(),
            description: item.description?.trim() || null,
            order: item.order !== undefined ? item.order : index,
            isRequired: item.isRequired || false,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: "قالب با موفقیت ایجاد شد",
    });
  } catch (error: unknown) {
    console.error("Error creating template:", error);
    const errorMessage = error instanceof Error ? error.message : "خطا در ایجاد قالب";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
