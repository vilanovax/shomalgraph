import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { filterBadWords, canUserComment, applyPenalty, calculateScorePenalty } from "@/lib/utils/bad-words";
import { 
  containsLinks, 
  checkRateLimit, 
  checkSuspiciousBehavior,
  detectSpam,
  detectAdvertisement 
} from "@/lib/utils/comment-security";

// GET: دریافت کامنت‌های یک آیتم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const restaurantId = searchParams.get("restaurantId");
    const placeId = searchParams.get("placeId");
    const checklistId = searchParams.get("checklistId");

    if (!itemType) {
      return NextResponse.json(
        { success: false, error: "نوع آیتم مشخص نشده" },
        { status: 400 }
      );
    }

    const where: {
      itemType: "RESTAURANT" | "PLACE" | "CHECKLIST";
      status: { in: ("ACTIVE" | "CENSORED")[] };
      restaurantId?: string;
      placeId?: string;
      checklistId?: string;
    } = {
      itemType: itemType as "RESTAURANT" | "PLACE" | "CHECKLIST",
      status: {
        in: ["ACTIVE", "CENSORED"] as ("ACTIVE" | "CENSORED")[],
      },
    };

    if (restaurantId) where.restaurantId = restaurantId;
    if (placeId) where.placeId = placeId;
    if (checklistId) where.checklistId = checklistId;

    // Pagination و Sort
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const sort = searchParams.get("sort") || "newest"; // newest یا top

    const session = await auth();
    const isAdmin = session?.user.role === "ADMIN";

    // بهینه‌سازی: برای newest از Prisma orderBy استفاده می‌کنیم (خیلی سریع‌تر)
    // برای top، فقط تعداد محدودی را می‌گیریم و مرتب می‌کنیم
    let comments: Array<{
      id: string;
      content: string;
      censoredContent: string | null;
      hasBadWords: boolean;
      status: string;
      likeCount: number;
      reportCount: number;
      createdAt: Date;
      userId: string;
      user: { id: string; name: string | null; phone: string; avatar: string | null };
      restaurantId: string | null;
      placeId: string | null;
      checklistId: string | null;
    }>;
    let totalCount: number;

    if (sort === "newest") {
      // استفاده از orderBy در Prisma - بسیار سریع‌تر
      [comments, totalCount] = await Promise.all([
        db.comment.findMany({
          where,
          select: {
            id: true,
            content: true,
            censoredContent: true,
            hasBadWords: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            likeCount: true,
            reportCount: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip,
        }),
        db.comment.count({ where }),
      ]);
    } else {
      // برای sort="top": فقط تعداد محدودی را می‌گیریم (حداکثر 100 تا برای مرتب‌سازی)
      // این خیلی سریع‌تر از گرفتن همه کامنت‌هاست
      const maxCommentsForSort = Math.min(100, limit * 5); // برای مرتب‌سازی بهتر
      
      const allComments = await db.comment.findMany({
        where,
        select: {
          id: true,
          content: true,
          censoredContent: true,
          hasBadWords: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          likeCount: true,
          reportCount: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: maxCommentsForSort, // فقط تعداد محدودی
      });

      totalCount = await db.comment.count({ where });

      // مرتب‌سازی بر اساس امتیاز (لایک - ریپورت)
      const sortedComments = [...allComments].sort((a, b) => {
        const scoreA = a.likeCount - a.reportCount;
        const scoreB = b.likeCount - b.reportCount;
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // نزولی
        }
        // اگر امتیاز برابر بود، جدیدترین را اول بگذار
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Pagination
      comments = sortedComments.slice(skip, skip + limit);
    }

    // بررسی لایک‌های کاربر (فقط اگر لاگین باشد)
    // بهینه‌سازی: فقط یک query برای همه لایک‌ها
    const commentIds = comments.map((c) => c.id);
    let likedCommentIds = new Set<string>();
    
    if (session && commentIds.length > 0) {
      // استفاده از findMany با in - سریع‌تر از چندین query
      const userLikes = await db.commentLikeNew.findMany({
        where: {
          userId: session.user.id,
          commentId: {
            in: commentIds,
          },
        },
        select: {
          commentId: true,
        },
      });
      likedCommentIds = new Set(userLikes.map((l) => l.commentId));
    }

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: isAdmin ? comment.content : comment.censoredContent,
      hasBadWords: comment.hasBadWords,
      status: comment.status,
      likeCount: comment.likeCount,
      reportCount: comment.reportCount,
      user: comment.user,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isLiked: likedCommentIds.has(comment.id),
    }));

    return NextResponse.json({
      success: true,
      data: formattedComments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت کامنت‌ها",
      },
      { status: 500 }
    );
  }
}

// POST: ایجاد کامنت جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "لطفاً وارد حساب کاربری شوید" },
        { status: 401 }
      );
    }

    // بررسی اینکه آیا کاربر می‌تواند کامنت بنویسد
    try {
      const canComment = await canUserComment(session.user.id);
      if (!canComment.canComment) {
        return NextResponse.json(
          {
            success: false,
            error: canComment.reason || "شما نمی‌توانید کامنت بنویسید",
          },
          { status: 403 }
        );
      }
    } catch (canCommentError) {
      console.error("Error checking can comment:", canCommentError);
      // اگر بررسی خطا داد، اجازه می‌دهیم ادامه دهد (fail open)
    }

    // بررسی Rate Limiting
    try {
      const rateLimit = await checkRateLimit(session.user.id);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `شما بیش از حد مجاز کامنت ارسال کرده‌اید. لطفاً ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)} ثانیه صبر کنید.`,
          },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      console.error("Error checking rate limit:", rateLimitError);
      // ادامه می‌دهیم اگر rate limit check خطا داد
    }

    const body = await request.json();
    const { itemType, restaurantId, placeId, checklistId, content } = body;

    if (!itemType || !content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "نوع آیتم و محتوای کامنت اجباری است" },
        { status: 400 }
      );
    }

    // بررسی اینکه حداقل یکی از IDها مشخص شده باشد
    if (!restaurantId && !placeId && !checklistId) {
      return NextResponse.json(
        { success: false, error: "باید حداقل یک آیتم مشخص شود" },
        { status: 400 }
      );
    }

    // بررسی لینک‌ها
    if (containsLinks(content)) {
      return NextResponse.json(
        {
          success: false,
          error: "ارسال لینک در کامنت مجاز نیست",
        },
        { status: 400 }
      );
    }

    // بررسی اسپم
    const spamCheck = detectSpam(content);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        {
          success: false,
          error: "کامنت شما به عنوان اسپم شناسایی شد",
        },
        { status: 400 }
      );
    }

    // بررسی تبلیغات
    const adCheck = detectAdvertisement(content);
    if (adCheck.isAdvertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "ارسال تبلیغات در کامنت مجاز نیست",
        },
        { status: 400 }
      );
    }

    // بررسی الگوی رفتاری مشکوک (non-blocking)
    try {
      const behaviorCheck = await checkSuspiciousBehavior(session.user.id);
      if (behaviorCheck.isSuspicious) {
        // فقط هشدار می‌دهیم، اما کامنت را ثبت می‌کنیم
        console.warn(`Suspicious behavior detected for user ${session.user.id}:`, behaviorCheck.reasons);
      }
    } catch (behaviorError) {
      console.error("Error checking suspicious behavior:", behaviorError);
      // ادامه می‌دهیم اگر behavior check خطا داد
    }

    // فیلتر کلمات بد
    let filtered = content;
    let hasBadWords = false;
    let matches: Array<{ word: string; severity: "MILD" | "MODERATE" | "SEVERE" }> = [];
    
    try {
      const badWordsResult = await filterBadWords(content);
      filtered = badWordsResult.filtered;
      hasBadWords = badWordsResult.hasBadWords;
      matches = badWordsResult.matches;
    } catch (badWordsError) {
      console.error("Error filtering bad words:", badWordsError);
      // اگر فیلتر کلمات بد خطا داد، از متن اصلی استفاده می‌کنیم
      filtered = content;
      hasBadWords = false;
      matches = [];
    }

    // ایجاد کامنت
    const comment = await db.comment.create({
      data: {
        userId: session.user.id,
        itemType: itemType as "RESTAURANT" | "PLACE" | "CHECKLIST",
        restaurantId: restaurantId || null,
        placeId: placeId || null,
        checklistId: checklistId || null,
        content: content.trim(),
        censoredContent: filtered.trim(),
        hasBadWords,
        status: (hasBadWords ? "CENSORED" : "ACTIVE") as "ACTIVE" | "CENSORED" | "HIDDEN" | "DELETED",
      },
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

    // اگر کلمات بد داشت، امتیاز منفی اعمال می‌شود (non-blocking)
    if (hasBadWords && matches.length > 0) {
      try {
        const penalty = await calculateScorePenalty(matches);
        await applyPenalty(session.user.id, penalty, "استفاده از کلمات نامناسب در کامنت");
      } catch (penaltyError) {
        console.error("Error applying penalty:", penaltyError);
        // ادامه می‌دهیم حتی اگر penalty اعمال نشد
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        content: comment.censoredContent, // برای کاربر عادی متن سانسور شده
        hasBadWords: comment.hasBadWords,
        status: comment.status,
        likeCount: comment._count.likes || 0,
        reportCount: comment._count.reports || 0,
        user: comment.user,
        createdAt: comment.createdAt,
        isLiked: false,
      },
      message: hasBadWords
        ? "کامنت شما ثبت شد اما برخی کلمات فیلتر شدند"
        : "کامنت با موفقیت ثبت شد",
    });
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    
    // نمایش جزئیات خطا برای debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطا در ایجاد کامنت",
      },
      { status: 500 }
    );
  }
}

