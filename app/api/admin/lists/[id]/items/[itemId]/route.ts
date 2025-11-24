import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// DELETE: حذف آیتم از لیست
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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    await db.listItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت از لیست حذف شد",
    });
  } catch (error) {
    console.error("Error deleting list item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش آیتم (order, note)
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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const body = await request.json();
    const { order, note } = body;

    const updatedItem = await db.listItem.update({
      where: { id: itemId },
      data: {
        order: order !== undefined ? order : undefined,
        note: note !== undefined ? note : undefined,
      },
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
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "آیتم با موفقیت ویرایش شد",
    });
  } catch (error) {
    console.error("Error updating list item:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ویرایش آیتم" },
      { status: 500 }
    );
  }
}

