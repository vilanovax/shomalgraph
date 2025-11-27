import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applyPenalty } from "@/lib/utils/bad-words";

// Helper function to get score settings
async function getScoreSettings() {
  const settings = await db.setting.findMany({
    where: {
      category: "comment_scores",
    },
  });

  const settingsMap: Record<string, number> = {};
  settings.forEach((setting) => {
    if (setting.value) {
      settingsMap[setting.key] = parseInt(setting.value, 10);
    }
  });

  return {
    report: settingsMap["report_penalty"] ?? -3,
  };
}

// POST: ریپورت کامنت
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد حساب کاربری شوید" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "دلیل ریپورت اجباری است" },
        { status: 400 }
      );
    }

    // بررسی وجود کامنت
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "کامنت یافت نشد" },
        { status: 404 }
      );
    }

    // کاربر نمی‌تواند کامنت خودش را ریپورت کند
    if (comment.userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "شما نمی‌توانید کامنت خودتان را ریپورت کنید" },
        { status: 400 }
      );
    }

    // بررسی اینکه آیا قبلاً ریپورت کرده
    const existingReport = await db.commentReportNew.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: "شما قبلاً این کامنت را ریپورت کرده‌اید" },
        { status: 400 }
      );
    }

    // ایجاد ریپورت
    await db.commentReportNew.create({
      data: {
        userId: session.user.id,
        commentId,
        reason: reason as string,
        status: "pending",
      },
    });

    // افزایش تعداد ریپورت‌ها
    await db.comment.update({
      where: { id: commentId },
      data: {
        reportCount: {
          increment: 1,
        },
      },
    });

    // اگر تعداد ریپورت‌ها از حد مشخصی بیشتر شد، امتیاز منفی به نویسنده
    const updatedComment = await db.comment.findUnique({
      where: { id: commentId },
      select: { reportCount: true },
    });

    // اعمال امتیاز منفی به نویسنده کامنت برای هر ریپورت
    const settings = await getScoreSettings();
    await applyPenalty(comment.userId, settings.report, "دریافت ریپورت برای کامنت");

    return NextResponse.json({
      success: true,
      message: "ریپورت با موفقیت ثبت شد",
    });
  } catch (error: unknown) {
    console.error("Error reporting comment:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ثبت ریپورت" },
      { status: 500 }
    );
  }
}

