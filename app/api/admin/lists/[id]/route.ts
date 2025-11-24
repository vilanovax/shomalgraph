import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: جزئیات یک لیست
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const list = await db.list.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
              },
            },
            place: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: "لیست یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش لیست
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, slug, coverImage, keywords } = body;

    // ساخت object داده‌ها به صورت داینامیک
    const updateData: {
      title: string;
      description?: string | null;
      slug: string;
      coverImage?: string | null;
      keywords?: string[];
    } = {
      title,
      slug,
    };

    // اضافه کردن فیلدهای اختیاری فقط اگر تعریف شده باشند
    if (description !== undefined) {
      updateData.description = description || null;
    }
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage || null;
    }
    if (keywords !== undefined) {
      updateData.keywords = Array.isArray(keywords) ? keywords : [];
    }

    const updatedList = await db.list.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedList,
      message: "لیست با موفقیت ویرایش شد",
    });
  } catch (error: unknown) {
    console.error("Error updating list:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "لیستی با این slug قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "خطا در ویرایش لیست";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: حذف لیست
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await db.list.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "لیست با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف لیست" },
      { status: 500 }
    );
  }
}

