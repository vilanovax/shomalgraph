import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";
import type {
  PlanType,
  TravelType,
  AvailableTime,
  Budget,
  TravelStyle,
  TimeSlot,
  PlanItemType,
  PlaceType,
  RestaurantPriceRange,
  SuitableFor,
} from "@prisma/client";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface QuickPlanRequest {
  location: Location;
  travelType: TravelType;
  availableTime: AvailableTime;
}

interface DailyPlanRequest {
  location: Location;
  searchRadius: number;
  travelType: TravelType;
  startTime: string;
  endTime: string;
  budget?: Budget;
  interests: string[];
}

interface TripPlanRequest {
  location: Location;
  searchRadius: number;
  startDate: Date;
  endDate: Date;
  travelType: TravelType;
  travelStyle: TravelStyle;
  budget?: Budget;
  preferences: Record<string, number>; // اولویت‌ها (طبیعت: 80, غذا: 60 و...)
  interests: string[];
}

interface PlanItem {
  id: string;
  name: string;
  type: "restaurant" | "place";
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  reviewCount: number;
  distance: number;
  travelTime: number; // زمان رسیدن به دقیقه
  priceRange?: RestaurantPriceRange;
  placeType?: PlaceType;
  entryFee?: number;
  isFree?: boolean;
  suitableFor?: SuitableFor[];
  description?: string;
  category?: string;
  tips?: string;
}

interface ScheduledItem extends PlanItem {
  timeSlot?: TimeSlot;
  scheduledTime?: Date;
  duration: number;
  order: number;
  dayNumber?: number;
}

// تبدیل TravelType به SuitableFor
function travelTypeToSuitableFor(travelType: TravelType): SuitableFor[] {
  switch (travelType) {
    case "SOLO":
      return ["SOLO"];
    case "COUPLE":
      return ["COUPLE"];
    case "FAMILY_WITH_KIDS":
      return ["FAMILY", "KIDS"];
    case "FAMILY_ADULTS":
      return ["FAMILY"];
    case "FRIENDS":
      return ["FRIENDS"];
    default:
      return [];
  }
}

// فیلتر رستوران‌ها
async function filterRestaurants(
  location: Location,
  searchRadius: number,
  travelType: TravelType,
  budget?: Budget,
  interests: string[] = []
): Promise<PlanItem[]> {
  const suitableFor = travelTypeToSuitableFor(travelType);

  const restaurants = await db.restaurant.findMany({
    where: {
      isActive: true,
      ...(budget && budget !== "ANY" && { priceRange: budget }),
    },
    include: {
      category: true,
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  console.log(`Total restaurants in DB: ${restaurants.length}`);

  const items: PlanItem[] = [];

  for (const restaurant of restaurants) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      restaurant.latitude,
      restaurant.longitude
    );

    if (distance > searchRadius) continue;

    // فیلتر بر اساس علایق - اگر علایق خالی باشد، همه رستوران‌ها را می‌پذیریم
    if (interests.length > 0) {
      const hasInterest =
        interests.includes("restaurant") ||
        interests.includes("رستوران") ||
        interests.includes("کافه") ||
        interests.includes("غذا");
      if (!hasInterest) continue;
    }

    // محاسبه زمان رسیدن (فرض: 50 کیلومتر بر ساعت)
    const travelTime = Math.round((distance / 50) * 60);

    items.push({
      id: restaurant.id,
      name: restaurant.name,
      type: "restaurant",
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      address: restaurant.address,
      rating: restaurant.rating,
      reviewCount: restaurant._count.reviews,
      distance,
      travelTime,
      priceRange: restaurant.priceRange,
      description: restaurant.description || undefined,
      category: restaurant.category?.name,
    });
  }

  return items;
}

// فیلتر مکان‌های گردشگری
async function filterPlaces(
  location: Location,
  searchRadius: number,
  travelType: TravelType,
  interests: string[] = []
): Promise<PlanItem[]> {
  const suitableFor = travelTypeToSuitableFor(travelType);

  // اگر suitableFor خالی باشد، همه مکان‌ها را می‌گیریم
  const whereClause: any = {
    isActive: true,
  };

  // فقط اگر suitableFor وجود داشته باشد، فیلتر می‌کنیم
  // در غیر این صورت همه مکان‌ها را می‌پذیریم
  if (suitableFor.length > 0) {
    whereClause.suitableFor = {
      hasSome: suitableFor,
    };
  }

  const places = await db.touristPlace.findMany({
    where: whereClause,
    include: {
      category: true,
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  console.log(`Total places in DB: ${places.length}`);

  const items: PlanItem[] = [];

  // نقشه‌برداری علایق به PlaceType
  const interestToPlaceType: Record<string, PlaceType[]> = {
    nature: ["NATURE", "FOREST", "MOUNTAIN", "WATERFALL", "PARK"],
    طبیعت: ["NATURE", "FOREST", "MOUNTAIN", "WATERFALL", "PARK"],
    beach: ["BEACH"],
    ساحل: ["BEACH"],
    mountain: ["MOUNTAIN"],
    کوه: ["MOUNTAIN"],
    museum: ["CULTURAL", "HISTORICAL"],
    موزه: ["CULTURAL", "HISTORICAL"],
    entertainment: ["ENTERTAINMENT", "PARK"],
    تفریحی: ["ENTERTAINMENT", "PARK"],
    historical: ["HISTORICAL", "CULTURAL"],
    تاریخی: ["HISTORICAL", "CULTURAL"],
  };

  for (const place of places) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      place.latitude,
      place.longitude
    );

    if (distance > searchRadius) continue;

    // فیلتر بر اساس علایق - اگر علایق خالی باشد، همه مکان‌ها را می‌پذیریم
    if (interests.length > 0) {
      let hasInterest = false;
      for (const interest of interests) {
        const placeTypes = interestToPlaceType[interest] || [];
        if (placeTypes.includes(place.placeType)) {
          hasInterest = true;
          break;
        }
        // اگر علاقه "place" یا "مکان" باشد، همه مکان‌ها را می‌پذیریم
        if (interest === "place" || interest === "مکان") {
          hasInterest = true;
          break;
        }
      }
      if (!hasInterest) continue;
    }

    // محاسبه زمان رسیدن
    const travelTime = Math.round((distance / 50) * 60);

    items.push({
      id: place.id,
      name: place.name,
      type: "place",
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
      rating: place.rating,
      reviewCount: place._count.reviews,
      distance,
      travelTime,
      placeType: place.placeType,
      entryFee: place.entryFee || undefined,
      isFree: place.isFree,
      suitableFor: place.suitableFor,
      description: place.description || undefined,
      category: place.category?.name,
    });
  }

  return items;
}

// اولویت‌بندی آیتم‌ها
function prioritizeItems(items: PlanItem[]): PlanItem[] {
  return items.sort((a, b) => {
    // اولویت 1: امتیاز بالاتر
    if (Math.abs(a.rating - b.rating) > 0.5) {
      return b.rating - a.rating;
    }
    // اولویت 2: تعداد نظرات بیشتر
    if (a.reviewCount !== b.reviewCount) {
      return b.reviewCount - a.reviewCount;
    }
    // اولویت 3: فاصله کمتر
    return a.distance - b.distance;
  });
}

// برنامه فوری
export async function generateQuickPlan(
  request: QuickPlanRequest
): Promise<PlanItem[]> {
  const { location, travelType, availableTime } = request;

  // تعیین محدوده بر اساس زمان موجود
  let searchRadius = 5; // پیش‌فرض
  let maxItems = 3;

  switch (availableTime) {
    case "ONE_TO_TWO_HOURS":
      searchRadius = 5;
      maxItems = 3;
      break;
    case "HALF_DAY":
      searchRadius = 15;
      maxItems = 5;
      break;
    case "FULL_DAY":
      searchRadius = 30;
      maxItems = 7;
      break;
  }

  // دریافت رستوران‌ها و مکان‌ها
  const [restaurants, places] = await Promise.all([
    filterRestaurants(location, searchRadius, travelType),
    filterPlaces(location, searchRadius, travelType),
  ]);

  // ترکیب و اولویت‌بندی
  const allItems = prioritizeItems([...restaurants, ...places]);

  // انتخاب بهترین‌ها
  return allItems.slice(0, maxItems);
}

// برنامه روزانه
export async function generateDailyPlan(
  request: DailyPlanRequest
): Promise<ScheduledItem[]> {
  const {
    location,
    searchRadius,
    travelType,
    startTime,
    endTime,
    budget,
    interests,
  } = request;

  console.log("generateDailyPlan called with:", {
    location,
    searchRadius,
    travelType,
    interests,
  });

  // دریافت آیتم‌ها
  const [restaurants, places] = await Promise.all([
    filterRestaurants(location, searchRadius, travelType, budget, interests),
    filterPlaces(location, searchRadius, travelType, interests),
  ]);

  console.log(`Found ${restaurants.length} restaurants and ${places.length} places`);

  // اولویت‌بندی
  const allItems = prioritizeItems([...restaurants, ...places]);

  if (allItems.length === 0) {
    console.warn("No items found after filtering");
    return [];
  }

  // زمان‌بندی
  const scheduledItems = scheduleItems(
    allItems,
    startTime,
    endTime,
    location
  );

  console.log(`Scheduled ${scheduledItems.length} items`);

  return scheduledItems;
}

// برنامه چندروزه
export async function generateTripPlan(
  request: TripPlanRequest
): Promise<Map<number, ScheduledItem[]>> {
  const {
    location,
    searchRadius,
    startDate,
    endDate,
    travelType,
    travelStyle,
    budget,
    preferences,
    interests,
  } = request;

  // محاسبه تعداد روزها
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // دریافت آیتم‌ها
  const [restaurants, places] = await Promise.all([
    filterRestaurants(location, searchRadius, travelType, budget, interests),
    filterPlaces(location, searchRadius, travelType, interests),
  ]);

  // اولویت‌بندی بر اساس preferences
  const prioritizedItems = prioritizeByPreferences(
    [...restaurants, ...places],
    preferences
  );

  // توزیع در روزها
  const planByDay = new Map<number, ScheduledItem[]>();

  for (let day = 1; day <= days; day++) {
    const dayStartTime = "09:00";
    const dayEndTime = "22:00";

    // انتخاب آیتم‌ها برای این روز (توزیع متعادل)
    const itemsPerDay = Math.ceil(prioritizedItems.length / days);
    const dayItems = prioritizedItems.slice(
      (day - 1) * itemsPerDay,
      day * itemsPerDay
    );

    // زمان‌بندی
    const scheduled = scheduleItems(dayItems, dayStartTime, dayEndTime, location);

    planByDay.set(day, scheduled);
  }

  return planByDay;
}

// زمان‌بندی آیتم‌ها
function scheduleItems(
  items: PlanItem[],
  startTime: string,
  endTime: string,
  startLocation: Location
): ScheduledItem[] {
  const scheduled: ScheduledItem[] = [];
  let currentTime = parseTime(startTime);
  let currentLocation = startLocation;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // محاسبه زمان رسیدن
    const travelTime = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      item.latitude,
      item.longitude
    );
    const travelMinutes = Math.round((travelTime / 50) * 60);

    // اضافه کردن زمان سفر
    currentTime = addMinutes(currentTime, travelTime > 0 ? travelMinutes : 0);

    // تعیین مدت زمان فعالیت
    let duration = 60; // پیش‌فرض 1 ساعت
    if (item.type === "restaurant") {
      duration = item.priceRange === "LUXURY" ? 120 : 90;
    } else if (item.type === "place") {
      duration = item.placeType === "NATURE" ? 120 : 90;
    }

    // بررسی اینکه زمان پایان نرسیده باشد
    const endTimeDate = parseTime(endTime);
    if (currentTime >= endTimeDate) break;

    // تعیین timeSlot
    const timeSlot = getTimeSlot(currentTime);

    scheduled.push({
      ...item,
      timeSlot,
      scheduledTime: new Date(currentTime),
      duration,
      order: i + 1,
      travelTime: travelMinutes,
      distance: travelTime,
    });

    // به‌روزرسانی زمان و موقعیت
    currentTime = addMinutes(currentTime, duration);
    currentLocation = {
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
    };
  }

  return scheduled;
}

// اولویت‌بندی بر اساس preferences
function prioritizeByPreferences(
  items: PlanItem[],
  preferences: Record<string, number>
): PlanItem[] {
  return items.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // امتیاز بر اساس preferences
    if (a.type === "restaurant" && preferences["غذا"]) {
      scoreA += preferences["غذا"];
    }
    if (b.type === "restaurant" && preferences["غذا"]) {
      scoreB += preferences["غذا"];
    }

    if (a.type === "place") {
      const placeTypeScore = getPlaceTypeScore(a.placeType!, preferences);
      scoreA += placeTypeScore;
    }
    if (b.type === "place") {
      const placeTypeScore = getPlaceTypeScore(b.placeType!, preferences);
      scoreB += placeTypeScore;
    }

    // امتیاز بر اساس rating
    scoreA += a.rating * 10;
    scoreB += b.rating * 10;

    // امتیاز بر اساس تعداد نظرات
    scoreA += a.reviewCount * 0.1;
    scoreB += b.reviewCount * 0.1;

    return scoreB - scoreA;
  });
}

function getPlaceTypeScore(
  placeType: PlaceType,
  preferences: Record<string, number>
): number {
  const mapping: Record<PlaceType, string> = {
    NATURE: "طبیعت",
    BEACH: "ساحل",
    MOUNTAIN: "کوه",
    HISTORICAL: "تاریخی",
    CULTURAL: "فرهنگی",
    ENTERTAINMENT: "تفریحی",
    FOREST: "طبیعت",
    WATERFALL: "طبیعت",
    PARK: "تفریحی",
    OTHER: "مکان",
  };

  const preferenceKey = mapping[placeType] || "مکان";
  return preferences[preferenceKey] || 0;
}

// توابع کمکی
function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getTimeSlot(date: Date): TimeSlot {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 14) return "NOON";
  if (hour >= 14 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 22) return "EVENING";
  return "NIGHT";
}

// یکپارچه‌سازی با OpenAI (اختیاری)
export async function enhanceWithAI(
  items: PlanItem[],
  context: {
    travelType: TravelType;
    location: Location;
    preferences?: Record<string, number>;
  }
): Promise<PlanItem[]> {
  // بررسی وجود OpenAI API Key
  const openAISetting = await db.setting.findUnique({
    where: { key: "OPENAI_API_KEY" },
  });

  if (!openAISetting?.value) {
    // اگر API Key موجود نباشد، همان لیست را برگردان
    return items;
  }

  try {
    // TODO: فراخوانی OpenAI API برای بهینه‌سازی
    // فعلاً همان لیست را برمی‌گردانیم
    return items;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // در صورت خطا، لیست اصلی را برگردان
    return items;
  }
}

