import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت آیتم‌های یک لیست
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
    const items = await db.listItem.findMany({
      where: { listId: id },
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
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching list items:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت آیتم‌ها" },
      { status: 500 }
    );
  }
}

// POST: اضافه کردن آیتم به لیست
export async function POST(
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
    const { restaurantId, placeId, order, note } = body;

    if (!restaurantId && !placeId) {
      return NextResponse.json(
        { success: false, error: "باید رستوران یا مکان انتخاب شود" },
        { status: 400 }
      );
    }

    // بررسی اینکه آیا این آیتم قبلاً در لیست است
    const whereCondition: {
      listId: string;
      OR: Array<{ restaurantId?: string } | { placeId?: string }>;
    } = {
      listId: id,
      OR: [],
    };

    if (restaurantId) {
      whereCondition.OR.push({ restaurantId });
    }

    if (placeId) {
      whereCondition.OR.push({ placeId });
    }

    const existingItem = await db.listItem.findFirst({
      where: whereCondition,
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: "این آیتم قبلاً در لیست اضافه شده" },
        { status: 400 }
      );
    }

    // پیدا کردن آخرین order
    const lastItem = await db.listItem.findFirst({
      where: { listId: id },
      orderBy: { order: "desc" },
    });

    const newOrder = order || (lastItem ? lastItem.order + 1 : 0);

    const item = await db.listItem.create({
      data: {
        listId: id,
        restaurantId: restaurantId || null,
        placeId: placeId || null,
        order: newOrder,
        note: note || null,
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
      data: item,
      message: "آیتم با موفقیت به لیست اضافه شد",
    });
  } catch (error) {
    console.error("Error adding item to list:", error);
    return NextResponse.json(
      { success: false, error: "خطا در اضافه کردن آیتم" },
      { status: 500 }
    );
  }
}

