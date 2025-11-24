import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST: اضافه یا حذف بوک‌مارک
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantId, placeId } = body;

    if (!restaurantId && !placeId) {
      return NextResponse.json(
        { success: false, error: "باید رستوران یا مکان انتخاب شود" },
        { status: 400 }
      );
    }

    // بررسی وجود favorite
    let existingFavorite;
    if (restaurantId) {
      existingFavorite = await db.favorite.findFirst({
        where: {
          userId: session.user.id,
          restaurantId: restaurantId,
        },
      });
    } else if (placeId) {
      existingFavorite = await db.favorite.findFirst({
        where: {
          userId: session.user.id,
          placeId: placeId,
        },
      });
    }

    if (existingFavorite) {
      // حذف favorite
      await db.favorite.delete({
        where: { id: existingFavorite.id },
      });

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: "از بوک‌مارک‌ها حذف شد",
      });
    } else {
      // اضافه کردن favorite
      const favorite = await db.favorite.create({
        data: {
          userId: session.user.id,
          restaurantId: restaurantId || null,
          placeId: placeId || null,
        },
      });

      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: "به بوک‌مارک‌ها اضافه شد",
        data: favorite,
      });
    }
  } catch (error: unknown) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی بوک‌مارک" },
      { status: 500 }
    );
  }
}

// GET: بررسی وضعیت favorite
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, isFavorite: false },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const placeId = searchParams.get("placeId");

    if (!restaurantId && !placeId) {
      return NextResponse.json(
        { success: false, error: "باید رستوران یا مکان انتخاب شود" },
        { status: 400 }
      );
    }

    let favorite;
    if (restaurantId) {
      favorite = await db.favorite.findFirst({
        where: {
          userId: session.user.id,
          restaurantId: restaurantId,
        },
      });
    } else if (placeId) {
      favorite = await db.favorite.findFirst({
        where: {
          userId: session.user.id,
          placeId: placeId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error: unknown) {
    console.error("Error checking favorite:", error);
    return NextResponse.json(
      { success: false, error: "خطا در بررسی بوک‌مارک" },
      { status: 500 }
    );
  }
}

