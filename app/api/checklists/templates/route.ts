import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: دریافت لیست قالب‌های فعال
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const travelType = searchParams.get("travelType");
    const season = searchParams.get("season");

    const where: {
      isActive: boolean;
      travelType?: string;
      season?: string;
    } = {
      isActive: true,
    };

    if (travelType) {
      where.travelType = travelType as any;
    }

    if (season) {
      where.season = season as any;
    }

    const templates = await db.travelChecklistTemplate.findMany({
      where,
      include: {
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
    console.error("Error fetching checklist templates:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت قالب‌ها" },
      { status: 500 }
    );
  }
}
