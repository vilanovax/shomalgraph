import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ChecklistTravelType, Season } from "@prisma/client";

// GET: دریافت قالب
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const template = await db.travelChecklistTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "قالب یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error: unknown) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت قالب" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش قالب
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { title, description, icon, travelType, season, isActive, items } = body;

    // حذف آیتم‌های قدیمی و ایجاد جدید
    await db.checklistTemplateItem.deleteMany({
      where: { templateId: id },
    });

    const updateData: any = {
      title,
      description: description || null,
      icon: icon || null,
      travelType: travelType ? (travelType as ChecklistTravelType) : null,
      season: season ? (season as Season) : null,
      items: {
        create: items.map((item: any, index: number) => ({
          name: item.name,
          description: item.description || null,
          order: item.order !== undefined ? item.order : index,
          isRequired: item.isRequired || false,
        })),
      },
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedTemplate = await db.travelChecklistTemplate.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: "قالب با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی قالب" },
      { status: 500 }
    );
  }
}

// DELETE: حذف قالب
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await db.travelChecklistTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "قالب با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف قالب" },
      { status: 500 }
    );
  }
}
