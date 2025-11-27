import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST: مهار کاربر (Ban/Timeout)
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
    const { days, type, reason } = body;

    if (!days || !type) {
      return NextResponse.json(
        { success: false, error: "تعداد روز و نوع مهار اجباری است" },
        { status: 400 }
      );
    }

    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + parseInt(days));

    const updateData: {
      isCommentBanned?: boolean;
      commentBanUntil?: Date;
      isPlaceAddBanned?: boolean;
      placeAddBanUntil?: Date;
    } = {};

    if (type === "comment" || type === "both") {
      updateData.isCommentBanned = true;
      updateData.commentBanUntil = banUntil;
    }

    if (type === "place" || type === "both") {
      updateData.isPlaceAddBanned = true;
      updateData.placeAddBanUntil = banUntil;
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `کاربر به مدت ${days} روز مهار شد`,
    });
  } catch (error: unknown) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { success: false, error: "خطا در مهار کاربر" },
      { status: 500 }
    );
  }
}

