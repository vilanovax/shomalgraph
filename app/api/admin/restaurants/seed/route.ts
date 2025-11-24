import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST: افزودن 5 رستوران نمونه
export async function POST() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
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

    // داده‌های 5 رستوران نمونه
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
    ];

    // بررسی رستوران‌های موجود با همین slug
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
      return NextResponse.json({
        success: true,
        message: "همه رستوران‌های نمونه قبلاً اضافه شده‌اند",
        count: 0,
      });
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

    return NextResponse.json({
      success: true,
      message: `${createdRestaurants.length} رستوران نمونه با موفقیت اضافه شد`,
      count: createdRestaurants.length,
      restaurants: createdRestaurants.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
      })),
    });
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در افزودن رستوران‌های نمونه",
        details: error instanceof Error ? error.message : "خطای ناشناخته",
      },
      { status: 500 }
    );
  }
}

