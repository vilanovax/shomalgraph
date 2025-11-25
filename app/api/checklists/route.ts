import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ChecklistTravelType, Season } from "@prisma/client";

// GET: لیست چک‌لیست‌های کاربر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const travelType = searchParams.get("travelType");
    const search = searchParams.get("search");

    const where: any = {
      userId: session.user.id,
    };

    if (travelType) {
      where.travelType = travelType as ChecklistTravelType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const checklists = await db.travelChecklist.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // محاسبه درصد پیشرفت برای هر چک‌لیست
    const checklistsWithProgress = await Promise.all(
      checklists.map(async (checklist) => {
        const allItems = await db.checklistItem.findMany({
          where: { checklistId: checklist.id },
          select: { isChecked: true },
        });

        const checkedCount = allItems.filter((item) => item.isChecked).length;
        const totalCount = allItems.length;
        const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

        return {
          ...checklist,
          progress: Math.round(progress),
          checkedCount,
          totalCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: checklistsWithProgress,
    });
  } catch (error: unknown) {
    console.error("Error fetching checklists:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت چک‌لیست‌ها" },
      { status: 500 }
    );
  }
}

// POST: ایجاد چک‌لیست جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // بررسی وجود کاربر در دیتابیس
    let user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    // اگر کاربر با id پیدا نشد، با phone جستجو می‌کنیم
    if (!user && session.user.phone) {
      user = await db.user.findUnique({
        where: { phone: session.user.phone },
        select: { id: true },
      });
      
      // اگر هنوز پیدا نشد، کاربر جدید ایجاد می‌کنیم
      if (!user) {
        console.log("User not found, creating new user with phone:", session.user.phone);
        try {
          user = await db.user.create({
            data: {
              phone: session.user.phone,
              name: session.user.name || null,
              role: session.user.role || "USER",
            },
            select: { id: true },
          });
          console.log("User created successfully:", user.id);
        } catch (createError) {
          console.error("Error creating user:", createError);
          return NextResponse.json(
            { success: false, error: "خطا در ایجاد کاربر" },
            { status: 500 }
          );
        }
      }
    }

    if (!user) {
      console.error("User not found in database:", {
        id: session.user.id,
        phone: session.user.phone,
      });
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد. لطفاً دوباره وارد شوید." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      templateId,
      travelType,
      season,
      items,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "عنوان الزامی است" },
        { status: 400 }
      );
    }

    // اگر از قالب استفاده می‌شود، قالب را دریافت می‌کنیم
    let templateData = null;
    if (templateId) {
      templateData = await db.travelChecklistTemplate.findUnique({
        where: { id: templateId },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!templateData) {
        return NextResponse.json(
          { success: false, error: "قالب یافت نشد" },
          { status: 404 }
        );
      }
    }

    // ایجاد چک‌لیست
    const checklist = await db.travelChecklist.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        templateId: templateId || null,
        travelType: travelType
          ? (travelType as ChecklistTravelType)
          : null,
        season: season ? (season as Season) : null,
        items: {
          create: templateData
            ? templateData.items.map((item) => ({
                name: item.name,
                description: item.description,
                order: item.order,
                isRequired: item.isRequired,
                isChecked: false,
                templateItemId: item.id,
              }))
            : items && Array.isArray(items)
            ? items.map((item: any, index: number) => ({
                name: item.name,
                description: item.description || null,
                order: item.order !== undefined ? item.order : index,
                isRequired: item.isRequired || false,
                isChecked: false,
              }))
            : [],
        },
      },
    });

    // دریافت چک‌لیست کامل با روابط
    const fullChecklist = await db.travelChecklist.findUnique({
      where: { id: checklist.id },
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
      data: fullChecklist,
      message: "چک‌لیست با موفقیت ایجاد شد",
    });
  } catch (error: unknown) {
    console.error("Error creating checklist:", error);
    const errorMessage = error instanceof Error ? error.message : "خطا در ایجاد چک‌لیست";
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
