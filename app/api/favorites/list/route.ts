import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت لیست بوک‌مارک‌های کاربر
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error: unknown) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست بوک‌مارک‌ها" },
      { status: 500 }
    );
  }
}

