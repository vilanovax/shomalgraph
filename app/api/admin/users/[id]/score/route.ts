import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applyPenalty, applyBonus } from "@/lib/utils/bad-words";

// POST: تنظیم امتیاز کاربر
export async function POST(
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

    const { id: userId } = await params;
    const body = await request.json();
    const { adjustment, reason } = body;

    if (adjustment === undefined || adjustment === null) {
      return NextResponse.json(
        { success: false, error: "مقدار تغییر امتیاز اجباری است" },
        { status: 400 }
      );
    }

    const adjustmentNum = parseInt(adjustment);

    // دریافت امتیاز فعلی
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { score: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // اعمال تغییر امتیاز
    if (adjustmentNum > 0) {
      await applyBonus(userId, adjustmentNum, reason || "تنظیم دستی امتیاز توسط ادمین");
    } else if (adjustmentNum < 0) {
      await applyPenalty(userId, adjustmentNum, reason || "تنظیم دستی امتیاز توسط ادمین");
    }

    // دریافت امتیاز جدید
    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      select: { score: true },
    });

    return NextResponse.json({
      success: true,
      newScore: updatedUser?.score || user.score,
      message: `امتیاز کاربر ${adjustmentNum > 0 ? "افزایش" : "کاهش"} یافت`,
    });
  } catch (error: unknown) {
    console.error("Error adjusting user score:", error);
    return NextResponse.json(
      { success: false, error: "خطا در تنظیم امتیاز" },
      { status: 500 }
    );
  }
}

