"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function seedRestaurants() {
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
      where: { slug: "restaurant-cafe" },
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: "رستوران و کافه",
          slug: "restaurant-cafe",
          icon: "🍽️",
          description: "رستوران‌ها و کافه‌های محلی",
        },
      });
    }

    // داده‌های 10 رستوران نمونه
    const sampleRestaurants = [
      {
        name: "رستوران کوهستان",
        slug: "restaurant-kohestan",
        description: "رستوران سنتی با منوی غذاهای محلی شمالی و فضای دنج و آرامش‌بخش",
        address: "مازندران، رامسر، جاده ساحلی، کیلومتر 5",
        latitude: 36.9025,
        longitude: 50.6481,
        phone: "011-55223344",
        priceRange: "MODERATE" as const,
        rating: 4.5,
        reviewCount: 23,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "کافه ساحل",
        slug: "cafe-sahel",
        description: "کافه مدرن با نمای رو به دریا و نوشیدنی‌های خوشمزه و دسرهای خاص",
        address: "گیلان، رشت، بلوار ساحلی انزلی، پلاک 120",
        latitude: 37.4717,
        longitude: 49.4648,
        phone: "013-33221100",
        priceRange: "BUDGET" as const,
        rating: 4.2,
        reviewCount: 15,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "رستوران دریایی ماهی‌گیر",
        slug: "restaurant-mahigir",
        description: "رستوران تخصصی غذاهای دریایی با ماهی تازه روز و طعم‌های بی‌نظیر",
        address: "مازندران، نوشهر، خیابان ساحلی، نزدیک اسکله",
        latitude: 36.6481,
        longitude: 51.5000,
        phone: "011-44225566",
        priceRange: "EXPENSIVE" as const,
        rating: 4.8,
        reviewCount: 42,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "کافه جنگل",
        slug: "cafe-jangal",
        description: "کافه در دل طبیعت با فضای باز و منوی صبحانه و ناهار کامل",
        address: "گیلان، لاهیجان، جاده جنگل، کیلومتر 8",
        latitude: 37.2049,
        longitude: 50.0094,
        phone: "014-22334455",
        priceRange: "MODERATE" as const,
        rating: 4.3,
        reviewCount: 18,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "رستوران لوکس ویلا",
        slug: "restaurant-vila-luxury",
        description: "رستوران لاکچری با منوی بین‌المللی و فضای مجلل و سرویس عالی",
        address: "مازندران، بابلسر، بلوار ساحلی، هتل ویلا",
        latitude: 36.7022,
        longitude: 52.6578,
        phone: "011-66778899",
        priceRange: "LUXURY" as const,
        rating: 4.9,
        reviewCount: 67,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "رستوران محلی شمالی",
        slug: "restaurant-mahali-shomali",
        description: "رستوران با غذاهای محلی اصیل شمالی و محیطی سنتی و صمیمی",
        address: "مازندران، آمل، خیابان اصلی، پلاک 45",
        latitude: 36.4694,
        longitude: 52.3508,
        phone: "011-33445566",
        priceRange: "BUDGET" as const,
        rating: 4.4,
        reviewCount: 31,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "کافه کتابخانه",
        slug: "cafe-ketabkhane",
        description: "کافه کتاب با فضای آرام و مناسب برای مطالعه و کار",
        address: "گیلان، رشت، خیابان فرهنگ، کافه کتابخانه",
        latitude: 37.2808,
        longitude: 49.5832,
        phone: "013-22334455",
        priceRange: "MODERATE" as const,
        rating: 4.6,
        reviewCount: 28,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "رستوران کبابی آتش",
        slug: "restaurant-kababi-atesh",
        description: "رستوران تخصصی کباب با گوشت تازه و کباب‌های خوشمزه",
        address: "مازندران، ساری، بلوار طالقانی، رستوران کبابی آتش",
        latitude: 36.5633,
        longitude: 53.0581,
        phone: "011-77889900",
        priceRange: "MODERATE" as const,
        rating: 4.7,
        reviewCount: 55,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "کافه رستوران بامبو",
        slug: "cafe-restaurant-bamboo",
        description: "کافه رستوران مدرن با منوی متنوع و فضای دنج",
        address: "گیلان، انزلی، بلوار ساحلی، کافه بامبو",
        latitude: 37.4731,
        longitude: 49.4578,
        phone: "013-44556677",
        priceRange: "MODERATE" as const,
        rating: 4.5,
        reviewCount: 39,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
      {
        name: "رستوران ایتالیایی پیتزا",
        slug: "restaurant-italian-pizza",
        description: "رستوران ایتالیایی با پیتزاهای خوشمزه و پاستاهای تازه",
        address: "مازندران، چالوس، خیابان ساحلی، رستوران ایتالیایی",
        latitude: 36.6550,
        longitude: 51.4200,
        phone: "011-88990011",
        priceRange: "EXPENSIVE" as const,
        rating: 4.8,
        reviewCount: 72,
        categoryId: category.id,
        isVerified: true,
        isActive: true,
      },
    ];

    // بررسی رستوران‌های موجود
    const existingSlugs = await db.restaurant.findMany({
      where: {
        slug: {
          in: sampleRestaurants.map((r) => r.slug),
        },
      },
      select: { slug: true },
    });

    const existingSlugSet = new Set(existingSlugs.map((r) => r.slug));

    // فقط رستوران‌هایی که وجود ندارند را اضافه می‌کنیم
    const restaurantsToCreate = sampleRestaurants.filter(
      (r) => !existingSlugSet.has(r.slug)
    );

    if (restaurantsToCreate.length === 0) {
      return {
        success: true,
        message: "همه رستوران‌های نمونه قبلاً اضافه شده‌اند",
        count: 0,
      };
    }

    // ایجاد رستوران‌ها
    const createdRestaurants = await Promise.all(
      restaurantsToCreate.map((restaurant) =>
        db.restaurant.create({
          data: restaurant,
          include: {
            category: true,
          },
        })
      )
    );

    return {
      success: true,
      message: `${createdRestaurants.length} رستوران نمونه با موفقیت اضافه شد`,
      count: createdRestaurants.length,
      restaurants: createdRestaurants.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
      })),
    };
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    return {
      success: false,
      error: "خطا در افزودن رستوران‌های نمونه",
      details: error instanceof Error ? error.message : "خطای ناشناخته",
    };
  }
}

