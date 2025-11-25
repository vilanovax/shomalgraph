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

    const body = await request.json();
    const { title, description, icon, travelType, season, items } = body;

    if (!title) {
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

    // ایجاد قالب
    const template = await db.travelChecklistTemplate.create({
      data: {
        title,
        description: description || null,
        icon: icon || null,
        travelType: travelType ? (travelType as ChecklistTravelType) : null,
        season: season ? (season as Season) : null,
        isActive: true,
        createdById: session.user.id,
        items: {
          create: items.map((item: any, index: number) => ({
            name: item.name,
            description: item.description || null,
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
    return NextResponse.json(
      { success: false, error: "خطا در ایجاد قالب" },
      { status: 500 }
    );
  }
}
