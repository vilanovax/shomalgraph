import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applyPenalty } from "@/lib/utils/bad-words";
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
    deletedByAdmin: settingsMap["deleted_by_admin_penalty"] ?? -10,
  };
}

// GET: دریافت یک کامنت خاص
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    const isAdmin = session?.user.role === "ADMIN";

    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reports: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "کامنت یافت نشد" },
        { status: 404 }
      );
    }

    const isLiked = session
      ? await db.commentLikeNew.findUnique({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId: comment.id,
            },
          },
        }).then((like) => !!like)
      : false;

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        content: isAdmin ? comment.content : comment.censoredContent,
        likeCount: comment._count.likes,
        reportCount: comment._count.reports,
        isLiked,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت کامنت" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش کامنت (فقط توسط نویسنده یا ادمین)
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { content, status } = body;

    const comment = await db.comment.findUnique({
      where: { id },
      select: {
        userId: true,
        content: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "کامنت یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی دسترسی (فقط نویسنده یا ادمین)
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "شما اجازه ویرایش این کامنت را ندارید" },
        { status: 403 }
      );
    }

    // اگر ادمین است و status را تغییر می‌دهد
    if (session.user.role === "ADMIN" && status) {
      await db.comment.update({
        where: { id },
        data: { status: status as string },
      });

      return NextResponse.json({
        success: true,
        message: "وضعیت کامنت به‌روزرسانی شد",
      });
    }

    // اگر محتوا تغییر می‌کند، باید دوباره فیلتر شود
    if (content) {
      const { filterBadWords } = await import("@/lib/utils/bad-words");
      const { filtered, hasBadWords } = await filterBadWords(content);

      await db.comment.update({
        where: { id },
        data: {
          content: content.trim(),
          censoredContent: filtered.trim(),
          hasBadWords,
          status: hasBadWords ? "CENSORED" : "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "کامنت با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی کامنت" },
      { status: 500 }
    );
  }
}

// DELETE: حذف کامنت (فقط توسط نویسنده یا ادمین)
export async function DELETE(
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

    const { id } = await params;

    const comment = await db.comment.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "کامنت یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی دسترسی
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "شما اجازه حذف این کامنت را ندارید" },
        { status: 403 }
      );
    }

    // حذف فیزیکی یا soft delete
    if (session.user.role === "ADMIN") {
      // اگر ادمین کامنت را حذف می‌کند، امتیاز منفی به نویسنده اعمال می‌شود
      const settings = await getScoreSettings();
      await applyPenalty(comment.userId, settings.deletedByAdmin, "حذف کامنت توسط ادمین");
      
      // ادمین می‌تواند کاملاً حذف کند
      await db.comment.delete({
        where: { id },
      });
    } else {
      // کاربر عادی فقط soft delete
      await db.comment.update({
        where: { id },
        data: { status: "DELETED" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "کامنت با موفقیت حذف شد",
    });
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف کامنت" },
      { status: 500 }
    );
  }
}

