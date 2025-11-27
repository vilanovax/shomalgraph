import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applyBonus } from "@/lib/utils/bad-words";
import { SettingCategory } from "@prisma/client";

// Helper function to get score settings
async function getScoreSettings() {
  const settings = await db.setting.findMany({
    where: {
      category: SettingCategory.COMMENT_SCORES,
    },
  });

  const settingsMap: Record<string, number> = {};
  settings.forEach((setting) => {
    if (setting.value) {
      settingsMap[setting.key] = parseInt(setting.value, 10);
    }
  });

  return {
    like: settingsMap["like_bonus"] ?? 1,
  };
}

// POST: لایک/آنلایک کامنت
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

    // بررسی وجود کامنت و دریافت اطلاعات کاربر
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

    // بررسی اینکه آیا قبلاً لایک کرده
    const existingLike = await db.commentLikeNew.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // آنلایک
      await db.commentLikeNew.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      });

      // کاهش تعداد لایک‌ها
      await db.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      // حذف امتیاز مثبت (اگر کامنت متعلق به کاربر دیگری است)
      if (comment && comment.userId !== session.user.id) {
        const settings = await getScoreSettings();
        await applyBonus(comment.userId, -settings.like, "حذف لایک از کامنت");
      }

      return NextResponse.json({
        success: true,
        data: { isLiked: false },
        message: "لایک حذف شد",
      });
    } else {
      // لایک
      await db.commentLikeNew.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });

      // افزایش تعداد لایک‌ها
      await db.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      // اعمال امتیاز مثبت (اگر کامنت متعلق به کاربر دیگری است)
      if (comment && comment.userId !== session.user.id) {
        const settings = await getScoreSettings();
        await applyBonus(comment.userId, settings.like, "دریافت لایک برای کامنت");
      }

      return NextResponse.json({
        success: true,
        data: { isLiked: true },
        message: "لایک شد",
      });
    }
  } catch (error: unknown) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { success: false, error: "خطا در لایک کامنت" },
      { status: 500 }
    );
  }
}

