import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت لیست برنامه‌های کاربر
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
    const planType = searchParams.get("planType");
    const status = searchParams.get("status");

    const where: {
      userId: string;
      planType?: string;
      status?: string;
    } = {
      userId: session.user.id,
    };

    if (planType) {
      where.planType = planType;
    }

    if (status) {
      where.status = status;
    }

    const plans = await db.travelPlan.findMany({
      where,
      include: {
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
      data: plans,
    });
  } catch (error: unknown) {
    console.error("Error fetching user plans:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت برنامه‌ها" },
      { status: 500 }
    );
  }
}

