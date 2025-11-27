"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function seedPlaces() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "دسترسی غیرمجاز",
      };
    }

    // بررسی یا ایجاد دسته‌بندی
    let category = await db.category.findFirst({
      where: { slug: "tourism" },
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: "جاذبه گردشگری",
          slug: "tourism",
          icon: "🏞️",
          description: "مکان‌های گردشگری و طبیعی",
        },
      });
    }

    // داده‌های 10 مکان گردشگری نمونه
    const samplePlaces = [
      {
        name: "جنگل ابر",
        slug: "jangal-abar",
        description: "جنگل زیبای ابر با درختان سرسبز و هوای خنک و مطبوع",
        address: "مازندران، شاهرود، جاده جنگل ابر",
        latitude: 36.6333,
        longitude: 54.8500,
        placeType: "FOREST" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"] as const,
        rating: 4.8,
        reviewCount: 156,
        isFree: true,
        entryFee: null,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "آبشار لاتون",
        slug: "abshar-latun",
        description: "آبشار بلند و زیبای لاتون با طبیعت بکر و چشم‌انداز خیره‌کننده",
        address: "گیلان، آستارا، جاده لاتون، آبشار لاتون",
        latitude: 38.4333,
        longitude: 48.8667,
        placeType: "WATERFALL" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"] as const,
        rating: 4.7,
        reviewCount: 89,
        isFree: true,
        entryFee: null,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "ساحل چمخاله",
        slug: "sahel-chamkhale",
        description: "ساحل زیبا و آرام چمخاله با شن‌های طلایی و آب شفاف",
        address: "گیلان، لنگرود، ساحل چمخاله",
        latitude: 37.1833,
        longitude: 50.1500,
        placeType: "BEACH" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE", "KIDS"] as const,
        rating: 4.6,
        reviewCount: 124,
        isFree: true,
        entryFee: null,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "کوه دماوند",
        slug: "kuh-damavand",
        description: "بلندترین قله ایران با مناظر طبیعی بی‌نظیر و هوای پاک",
        address: "مازندران، آمل، جاده دماوند",
        latitude: 35.9517,
        longitude: 52.1083,
        placeType: "MOUNTAIN" as const,
        suitableFor: ["FRIENDS", "SOLO"] as const,
        rating: 4.9,
        reviewCount: 203,
        isFree: true,
        entryFee: null,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "پارک جنگلی نور",
        slug: "park-jangali-noor",
        description: "پارک جنگلی زیبا با امکانات تفریحی و فضای مناسب برای پیک‌نیک",
        address: "مازندران، نور، پارک جنگلی نور",
        latitude: 36.5833,
        longitude: 52.0167,
        placeType: "PARK" as const,
        suitableFor: ["FAMILY", "FRIENDS", "KIDS"] as const,
        rating: 4.4,
        reviewCount: 67,
        isFree: false,
        entryFee: 50000,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "تالاب انزلی",
        slug: "talab-anzali",
        description: "تالاب زیبا و بزرگ انزلی با قایق‌سواری و طبیعت منحصر به فرد",
        address: "گیلان، انزلی، تالاب انزلی",
        latitude: 37.4667,
        longitude: 49.4667,
        placeType: "NATURE" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"] as const,
        rating: 4.5,
        reviewCount: 178,
        isFree: false,
        entryFee: 100000,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "قلعه رودخان",
        slug: "ghale-rudkhan",
        description: "قلعه تاریخی و باستانی رودخان با معماری منحصر به فرد",
        address: "گیلان، فومن، جاده قلعه رودخان",
        latitude: 37.0667,
        longitude: 49.3167,
        placeType: "HISTORICAL" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"] as const,
        rating: 4.6,
        reviewCount: 145,
        isFree: false,
        entryFee: 80000,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "ساحل رامسر",
        slug: "sahel-ramsar",
        description: "ساحل زیبای رامسر با امکانات تفریحی و رستوران‌های ساحلی",
        address: "مازندران، رامسر، ساحل رامسر",
        latitude: 36.9167,
        longitude: 50.6500,
        placeType: "BEACH" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE", "KIDS"] as const,
        rating: 4.7,
        reviewCount: 234,
        isFree: true,
        entryFee: null,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "پارک آبی رامسر",
        slug: "park-abi-ramsar",
        description: "پارک آبی با استخر و سرسره‌های آبی و امکانات تفریحی",
        address: "مازندران، رامسر، پارک آبی",
        latitude: 36.9000,
        longitude: 50.6500,
        placeType: "ENTERTAINMENT" as const,
        suitableFor: ["FAMILY", "FRIENDS", "KIDS"] as const,
        rating: 4.3,
        reviewCount: 98,
        isFree: false,
        entryFee: 200000,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "موزه رشت",
        slug: "muze-rasht",
        description: "موزه تاریخی رشت با آثار باستانی و فرهنگی منطقه",
        address: "گیلان، رشت، خیابان امام، موزه رشت",
        latitude: 37.2808,
        longitude: 49.5832,
        placeType: "CULTURAL" as const,
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"] as const,
        rating: 4.2,
        reviewCount: 56,
        isFree: false,
        entryFee: 50000,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
    ];

    // بررسی مکان‌های موجود
    const existingSlugs = await db.touristPlace.findMany({
      where: {
        slug: {
          in: samplePlaces.map((p) => p.slug),
        },
      },
      select: { slug: true },
    });

    const existingSlugSet = new Set(existingSlugs.map((p) => p.slug));

    // فقط مکان‌هایی که وجود ندارند را اضافه می‌کنیم
    const placesToCreate = samplePlaces
      .filter((p) => !existingSlugSet.has(p.slug))
      .map((p) => ({
        ...p,
        suitableFor: [...p.suitableFor], // تبدیل readonly array به mutable array
      }));

    if (placesToCreate.length === 0) {
      return {
        success: true,
        message: "همه مکان‌های نمونه قبلاً اضافه شده‌اند",
        count: 0,
      };
    }

    // ایجاد مکان‌ها
    const createdPlaces = await Promise.all(
      placesToCreate.map((place) =>
        db.touristPlace.create({
          data: place,
          include: {
            category: true,
          },
        })
      )
    );

    return {
      success: true,
      message: `${createdPlaces.length} مکان گردشگری نمونه با موفقیت اضافه شد`,
      count: createdPlaces.length,
      places: createdPlaces.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
      })),
    };
  } catch (error) {
    console.error("Error seeding places:", error);
    return {
      success: false,
      error: "خطا در افزودن مکان‌های گردشگری نمونه",
      details: error instanceof Error ? error.message : "خطای ناشناخته",
    };
  }
}

