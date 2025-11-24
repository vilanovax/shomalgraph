import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 شروع افزودن رستوران‌های نمونه...");

  try {
    // بررسی یا ایجاد دسته‌بندی
    let category = await prisma.category.findFirst({
      where: { slug: "restaurant-cafe" },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "رستوران و کافه",
          slug: "restaurant-cafe",
          icon: "🍽️",
          description: "رستوران‌ها و کافه‌های محلی",
        },
      });
      console.log("✅ دسته‌بندی ایجاد شد:", category.name);
    } else {
      console.log("✅ دسته‌بندی موجود است:", category.name);
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

    // بررسی رستوران‌های موجود
    const existingSlugs = await prisma.restaurant.findMany({
      where: {
        slug: {
          in: sampleRestaurants.map((r) => r.slug),
        },
      },
      select: { slug: true, name: true },
    });

    const existingSlugSet = new Set(existingSlugs.map((r) => r.slug));

    if (existingSlugs.length > 0) {
      console.log(`⚠️  ${existingSlugs.length} رستوران قبلاً وجود دارد:`);
      existingSlugs.forEach((r) => console.log(`   - ${r.name}`));
    }

    // فقط رستوران‌هایی که وجود ندارند را اضافه می‌کنیم
    const restaurantsToCreate = sampleRestaurants.filter(
      (r) => !existingSlugSet.has(r.slug)
    );

    if (restaurantsToCreate.length === 0) {
      console.log("✅ همه رستوران‌های نمونه قبلاً اضافه شده‌اند");
      return;
    }

    console.log(`📝 در حال افزودن ${restaurantsToCreate.length} رستوران...`);

    // ایجاد رستوران‌ها
    const createdRestaurants = await Promise.all(
      restaurantsToCreate.map((restaurant) =>
        prisma.restaurant.create({
          data: restaurant,
          include: {
            category: true,
          },
        })
      )
    );

    console.log(`\n✅ ${createdRestaurants.length} رستوران با موفقیت اضافه شد:\n`);
    createdRestaurants.forEach((r, index) => {
      console.log(`${index + 1}. ${r.name}`);
      console.log(`   آدرس: ${r.address}`);
      console.log(`   قیمت: ${r.priceRange}`);
      console.log(`   امتیاز: ${r.rating} ⭐`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ خطا در افزودن رستوران‌ها:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

