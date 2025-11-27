import { db } from "@/lib/db";

/**
 * بررسی وجود لینک در متن
 */
export function containsLinks(text: string): boolean {
  // الگوهای مختلف لینک
  const linkPatterns = [
    /https?:\/\/[^\s]+/gi, // http:// یا https://
    /www\.[^\s]+/gi, // www.
    /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, // دامنه‌ها مثل example.com
    /bit\.ly\/[^\s]+/gi, // لینک‌های کوتاه
    /t\.me\/[^\s]+/gi, // تلگرام
    /instagram\.com\/[^\s]+/gi, // اینستاگرام
    /facebook\.com\/[^\s]+/gi, // فیسبوک
    /twitter\.com\/[^\s]+/gi, // توییتر
  ];

  return linkPatterns.some((pattern) => pattern.test(text));
}

/**
 * بررسی الگوی رفتاری مشکوک
 */
export async function checkSuspiciousBehavior(userId: string): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  // بررسی تعداد کامنت‌های کاربر در دقیقه گذشته
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentComments = await db.comment.count({
    where: {
      userId,
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  });

  if (recentComments >= 3) {
    reasons.push("ارسال بیش از حد کامنت در یک دقیقه");
  }

  // بررسی تعداد کامنت‌های حذف شده
  const deletedComments = await db.comment.count({
    where: {
      userId,
      status: "DELETED" as const, // Prisma enum
    },
  });

  const totalComments = await db.comment.count({
    where: { userId },
  });

  if (totalComments > 0 && deletedComments / totalComments > 0.5) {
    reasons.push("نسبت بالای کامنت‌های حذف شده");
  }

  // بررسی تعداد ریپورت‌ها
  const userComments = await db.comment.findMany({
    where: { userId },
    select: { id: true },
  });

  const commentIds = userComments.map((c) => c.id);
  if (commentIds.length > 0) {
    const reportCount = await db.commentReportNew.count({
      where: {
        commentId: {
          in: commentIds,
        },
      },
    });

    if (reportCount / commentIds.length > 0.3) {
      reasons.push("نسبت بالای ریپورت‌ها");
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * بررسی Rate Limiting برای کامنت‌ها
 */
export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  // تنظیمات: حداکثر 5 کامنت در دقیقه
  const MAX_COMMENTS_PER_MINUTE = 5;
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const recentComments = await db.comment.count({
    where: {
      userId,
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  });

  const remaining = Math.max(0, MAX_COMMENTS_PER_MINUTE - recentComments);
  const resetAt = new Date(Date.now() + 60 * 1000);

  return {
    allowed: remaining > 0,
    remaining,
    resetAt,
  };
}

/**
 * تشخیص اسپم با الگوهای ساده
 */
export function detectSpam(text: string): {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let confidence = 0;

  // بررسی تکرار کاراکترها
  if (/(.)\1{4,}/.test(text)) {
    reasons.push("تکرار بیش از حد کاراکترها");
    confidence += 0.3;
  }

  // بررسی تکرار کلمات
  const words = text.split(/\s+/);
  const wordCounts: Record<string, number> = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const maxRepeats = Math.max(...Object.values(wordCounts));
  if (maxRepeats >= 5) {
    reasons.push("تکرار بیش از حد کلمات");
    confidence += 0.3;
  }

  // بررسی طول غیرعادی
  if (text.length < 10) {
    reasons.push("کامنت خیلی کوتاه");
    confidence += 0.2;
  }

  // بررسی کلمات اسپم رایج
  const spamKeywords = [
    "خرید",
    "فروش",
    "تخفیف",
    "کد تخفیف",
    "لینک",
    "کلیک کنید",
    "رایگان",
    "فوری",
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = spamKeywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );

  if (foundKeywords.length >= 2) {
    reasons.push("استفاده از کلمات اسپم");
    confidence += 0.4;
  }

  return {
    isSpam: confidence >= 0.5,
    confidence,
    reasons,
  };
}

/**
 * تشخیص تبلیغات
 */
export function detectAdvertisement(text: string): {
  isAdvertisement: boolean;
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let confidence = 0;

  // کلمات کلیدی تبلیغاتی
  const adKeywords = [
    "خرید",
    "فروش",
    "تخفیف",
    "کد تخفیف",
    "پیشنهاد ویژه",
    "فروشگاه",
    "محصول",
    "خدمات",
    "قیمت",
    "ارزان",
    "رایگان",
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = adKeywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );

  if (foundKeywords.length >= 2) {
    reasons.push("استفاده از کلمات تبلیغاتی");
    confidence += 0.4;
  }

  // بررسی وجود شماره تلفن
  if (/\d{11}/.test(text) || /09\d{9}/.test(text)) {
    reasons.push("شماره تلفن در کامنت");
    confidence += 0.3;
  }

  // بررسی وجود ایمیل
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    reasons.push("ایمیل در کامنت");
    confidence += 0.3;
  }

  return {
    isAdvertisement: confidence >= 0.5,
    confidence,
    reasons,
  };
}

