import { db } from "@/lib/db";
import { CommentsManagementClient } from "./CommentsManagementClient";

async function getComments() {
  try {
    // بهینه‌سازی: استفاده از select به جای include و محدود کردن به 100 کامنت
    const comments = await db.comment.findMany({
      select: {
        id: true,
        content: true,
        censoredContent: true,
        hasBadWords: true,
        status: true,
        itemType: true,
        likeCount: true,
        reportCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            score: true,
            isCommentBanned: true,
            commentBanUntil: true,
            isPlaceAddBanned: true,
            placeAddBanUntil: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        checklist: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // کاهش از 200 به 100
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function getCommentStats() {
  try {
    // محاسبه stats در دیتابیس به جای client-side (خیلی سریع‌تر)
    const [
      total,
      active,
      censored,
      hidden,
      deleted,
      withBadWords,
    ] = await Promise.all([
      db.comment.count(),
      db.comment.count({ where: { status: "ACTIVE" } }),
      db.comment.count({ where: { status: "CENSORED" } }),
      db.comment.count({ where: { status: "HIDDEN" } }),
      db.comment.count({ where: { status: "DELETED" } }),
      db.comment.count({ where: { hasBadWords: true } }),
    ]);

    return {
      total,
      active,
      censored,
      hidden,
      deleted,
      withBadWords,
    };
  } catch (error) {
    console.error("Error fetching comment stats:", error);
    return {
      total: 0,
      active: 0,
      censored: 0,
      hidden: 0,
      deleted: 0,
      withBadWords: 0,
    };
  }
}

export default async function CommentsPage() {
  // Parallel data fetching برای بهبود سرعت
  const [comments, stats] = await Promise.all([
    getComments(),
    getCommentStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">مدیریت کامنت‌ها</h1>
              <p className="text-blue-100 text-sm mt-1">
                بررسی و مدیریت کامنت‌های کاربران
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">کل کامنت‌ها</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">فعال</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">فیلتر شده</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.censored}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">مخفی</div>
          <div className="text-2xl font-bold text-gray-600">{stats.hidden}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">حذف شده</div>
          <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">کلمات بد</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.withBadWords}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <CommentsManagementClient initialComments={comments} />
    </div>
  );
}

