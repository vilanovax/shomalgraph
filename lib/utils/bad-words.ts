import { db } from "@/lib/db";

export interface BadWordMatch {
  word: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
}

/**
 * فیلتر کلمات بد و جایگزینی با ستاره
 */
export async function filterBadWords(text: string): Promise<{
  filtered: string;
  hasBadWords: boolean;
  matches: BadWordMatch[];
}> {
  // دریافت لیست کلمات بد فعال از دیتابیس
  const badWords = await db.badWord.findMany({
    where: { isActive: true },
    select: {
      word: true,
      severity: true,
    },
  });

  if (badWords.length === 0) {
    return {
      filtered: text,
      hasBadWords: false,
      matches: [],
    };
  }

  let filtered = text;
  const matches: BadWordMatch[] = [];
  const foundWords = new Set<string>();

  // جستجوی هر کلمه بد در متن
  for (const badWord of badWords) {
    // استفاده از regex برای جستجوی case-insensitive
    const regex = new RegExp(badWord.word, "gi");
    const matchesInText = text.match(regex);

    if (matchesInText && matchesInText.length > 0) {
      // جایگزینی با ستاره
      const stars = "*".repeat(badWord.word.length);
      filtered = filtered.replace(regex, stars);

      if (!foundWords.has(badWord.word.toLowerCase())) {
        matches.push({
          word: badWord.word,
          severity: badWord.severity as "MILD" | "MODERATE" | "SEVERE",
        });
        foundWords.add(badWord.word.toLowerCase());
      }
    }
  }

  return {
    filtered,
    hasBadWords: matches.length > 0,
    matches,
  };
}

/**
 * دریافت تنظیمات امتیازدهی از دیتابیس
 */
async function getScoreSettings() {
  const settings = await db.setting.findMany({
    where: {
      category: "COMMENT_SCORES",
    },
  });

  const settingsMap: Record<string, number> = {};
  settings.forEach((setting) => {
    if (setting.value) {
      settingsMap[setting.key] = parseInt(setting.value, 10);
    }
  });

  // مقادیر پیش‌فرض
  return {
    badWords: settingsMap["bad_words_penalty"] ?? -5,
    report: settingsMap["report_penalty"] ?? -3,
    deletedByAdmin: settingsMap["deleted_by_admin_penalty"] ?? -10,
    like: settingsMap["like_bonus"] ?? 1,
    banThreshold1: settingsMap["ban_threshold_1"] ?? -10,
    banThreshold2: settingsMap["ban_threshold_2"] ?? -15,
    banThreshold3: settingsMap["ban_threshold_3"] ?? -20,
    banDays1: settingsMap["ban_days_1"] ?? 1,
    banDays2: settingsMap["ban_days_2"] ?? 3,
    banDays3: settingsMap["ban_days_3"] ?? 7,
    placeBanDays: settingsMap["place_ban_days"] ?? 30,
  };
}

/**
 * محاسبه امتیاز منفی بر اساس کلمات بد
 */
export async function calculateScorePenalty(matches: BadWordMatch[]): Promise<number> {
  const settings = await getScoreSettings();
  
  if (matches.length === 0) return 0;
  
  // اگر کلمات بد داشته باشد، امتیاز منفی اعمال می‌شود
  return settings.badWords;
}

/**
 * بررسی اینکه آیا کاربر می‌تواند کامنت بنویسد
 */
export async function canUserComment(userId: string): Promise<{
  canComment: boolean;
  reason?: string;
  banUntil?: Date;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isCommentBanned: true,
      commentBanUntil: true,
      score: true,
    },
  });

  if (!user) {
    return {
      canComment: false,
      reason: "کاربر یافت نشد",
    };
  }

  // بررسی ممنوعیت موقت
  if (user.isCommentBanned && user.commentBanUntil) {
    const now = new Date();
    if (user.commentBanUntil > now) {
      return {
        canComment: false,
        reason: `شما تا ${user.commentBanUntil.toLocaleDateString("fa-IR")} از نوشتن کامنت محروم هستید`,
        banUntil: user.commentBanUntil,
      };
    } else {
      // ممنوعیت تمام شده، باید برطرف شود
      await db.user.update({
        where: { id: userId },
        data: {
          isCommentBanned: false,
          commentBanUntil: null,
        },
      });
    }
  }

  // بررسی امتیاز منفی بر اساس تنظیمات
  const settings = await getScoreSettings();
  if (user.score <= settings.banThreshold1) {
    return {
      canComment: false,
      reason: "امتیاز شما برای نوشتن کامنت کافی نیست",
    };
  }

  return {
    canComment: true,
  };
}

/**
 * اعمال جریمه به کاربر
 */
export async function applyPenalty(
  userId: string,
  penalty: number,
  reason: string
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { score: true },
  });

  if (!user) return;

  const settings = await getScoreSettings();
  const newScore = user.score + penalty; // penalty منفی است

  // محاسبه ممنوعیت‌ها بر اساس تنظیمات
  let commentBanUntil: Date | null = null;
  let isCommentBanned = false;
  let placeAddBanUntil: Date | null = null;
  let isPlaceAddBanned = false;

  if (newScore <= settings.banThreshold3) {
    // ممنوعیت 3 (شدیدترین)
    commentBanUntil = new Date();
    commentBanUntil.setDate(commentBanUntil.getDate() + settings.banDays3);
    isCommentBanned = true;
    
    placeAddBanUntil = new Date();
    placeAddBanUntil.setDate(placeAddBanUntil.getDate() + settings.placeBanDays);
    isPlaceAddBanned = true;
  } else if (newScore <= settings.banThreshold2) {
    // ممنوعیت 2
    commentBanUntil = new Date();
    commentBanUntil.setDate(commentBanUntil.getDate() + settings.banDays2);
    isCommentBanned = true;
  } else if (newScore <= settings.banThreshold1) {
    // ممنوعیت 1
    commentBanUntil = new Date();
    commentBanUntil.setDate(commentBanUntil.getDate() + settings.banDays1);
    isCommentBanned = true;
  }

  await db.user.update({
    where: { id: userId },
    data: {
      score: newScore,
      isCommentBanned,
      commentBanUntil,
      isPlaceAddBanned,
      placeAddBanUntil,
    },
  });
}

/**
 * اعمال امتیاز مثبت (مثلاً برای لایک)
 */
export async function applyBonus(
  userId: string,
  bonus: number,
  reason: string
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { score: true },
  });

  if (!user) return;

  const newScore = user.score + bonus;

  await db.user.update({
    where: { id: userId },
    data: {
      score: newScore,
    },
  });
}

