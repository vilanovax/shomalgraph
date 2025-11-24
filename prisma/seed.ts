import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 شروع seed کردن دیتابیس...");

  // حذف دیتاهای قبلی
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.touristPlace.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ دیتاهای قبلی پاک شد");

  // ایجاد کاربران
  const admin = await prisma.user.create({
    data: {
      phone: "09121941532",
      name: "admin",
      role: "ADMIN",
    },
  });

  const businessOwner = await prisma.user.create({
    data: {
      phone: "09129876543",
      name: "صاحب رستوران",
      role: "BUSINESS_OWNER",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      phone: "09131112222",
      name: "محمد احمدی",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      phone: "09133334444",
      name: "فاطمه رضایی",
      role: "USER",
    },
  });

  console.log("✅ کاربران ایجاد شدند");

  // ایجاد دسته‌بندی‌ها
  const restaurantCategory = await prisma.category.create({
    data: {
      name: "رستوران و کافه",
      slug: "restaurant-cafe",
      icon: "🍽️",
      description: "رستوران‌ها و کافه‌های محلی",
    },
  });

  const tourismCategory = await prisma.category.create({
    data: {
      name: "جاذبه گردشگری",
      slug: "tourism",
      icon: "🏞️",
      description: "مکان‌های گردشگری و طبیعی",
    },
  });

  console.log("✅ دسته‌بندی‌ها ایجاد شدند");

  // ایجاد رستوران‌ها
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "رستوران سنتی شمال",
      slug: "shomal-restaurant",
      description:
        "رستوران سنتی با غذاهای محلی شمال ایران. محیط دلنشین با منظره جنگل.",
      address: "رامسر، خیابان امام خمینی، کوچه گلستان، پلاک 12",
      latitude: 36.9077,
      longitude: 50.6586,
      phone: "01155221234",
      priceRange: "MODERATE",
      rating: 4.5,
      reviewCount: 0,
      categoryId: restaurantCategory.id,
      ownerId: businessOwner.id,
      isVerified: true,
      isActive: true,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "کافه دریا",
      slug: "darya-cafe",
      description: "کافه مدرن با منظره دریا. قهوه‌های تخصصی و دسرهای خوشمزه.",
      address: "چالوس، بلوار ساحلی، نبش کوچه نسیم",
      latitude: 36.6552,
      longitude: 51.4205,
      phone: "01144556677",
      priceRange: "EXPENSIVE",
      rating: 4.8,
      reviewCount: 0,
      categoryId: restaurantCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: "رستوران کوهستان",
      slug: "koohestan-restaurant",
      description:
        "رستوران روی تپه با منظره کوه و جنگل. غذاهای ایرانی و محلی.",
      address: "رشت، جاده لشت نشا، کیلومتر 15",
      latitude: 37.2808,
      longitude: 49.5832,
      phone: "01333445566",
      priceRange: "BUDGET",
      rating: 4.2,
      reviewCount: 0,
      categoryId: restaurantCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  console.log("✅ رستوران‌ها ایجاد شدند");

  // ایجاد مکان‌های گردشگری
  const place1 = await prisma.touristPlace.create({
    data: {
      name: "آبشار لاتون",
      slug: "latoon-waterfall",
      description:
        "آبشار زیبا در دل جنگل‌های شمال. مسیر پیاده‌روی و منظره بی‌نظیر.",
      address: "رامسر، جاده کیاسر، روستای لاتون",
      latitude: 36.5659,
      longitude: 50.5282,
      placeType: "WATERFALL",
      suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
      rating: 4.7,
      reviewCount: 0,
      isFree: true,
      categoryId: tourismCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  const place2 = await prisma.touristPlace.create({
    data: {
      name: "تله‌کابین رامسر",
      slug: "ramsar-telecabin",
      description: "تله‌کابین با منظره دریا و جنگل. تجربه‌ای فراموش‌نشدنی.",
      address: "رامسر، بلوار شهید رجایی، ابتدای تله‌کابین",
      latitude: 36.9147,
      longitude: 50.6591,
      placeType: "ENTERTAINMENT",
      suitableFor: ["FAMILY", "COUPLE", "KIDS"],
      rating: 4.6,
      reviewCount: 0,
      isFree: false,
      entryFee: 500000,
      categoryId: tourismCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  const place3 = await prisma.touristPlace.create({
    data: {
      name: "جنگل ابر",
      slug: "jungle-e-abr",
      description: "جنگل زیبای ابر در ارتفاعات. هوای خنک و طبیعت بکر.",
      address: "شاهرود، جاده شاهرود به کلاردشت",
      latitude: 36.4183,
      longitude: 54.9764,
      placeType: "FOREST",
      suitableFor: ["FAMILY", "FRIENDS"],
      rating: 4.9,
      reviewCount: 0,
      isFree: true,
      categoryId: tourismCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  const place4 = await prisma.touristPlace.create({
    data: {
      name: "ساحل چمخاله",
      slug: "chamkhaleh-beach",
      description: "ساحل زیبا با شن‌های طلایی. مناسب برای شنا و تفریح.",
      address: "لنگرود، ساحل چمخاله",
      latitude: 37.1954,
      longitude: 50.1468,
      placeType: "BEACH",
      suitableFor: ["FAMILY", "KIDS", "FRIENDS"],
      rating: 4.4,
      reviewCount: 0,
      isFree: true,
      categoryId: tourismCategory.id,
      isVerified: true,
      isActive: true,
    },
  });

  console.log("✅ مکان‌های گردشگری ایجاد شدند");

  // ایجاد نظرات نمونه
  await prisma.review.createMany({
    data: [
      {
        userId: user1.id,
        restaurantId: restaurant1.id,
        rating: 5,
        comment: "غذاهای بسیار خوشمزه و محیط دلنشین. حتماً دوباره می‌آیم!",
      },
      {
        userId: user2.id,
        restaurantId: restaurant1.id,
        rating: 4,
        comment: "رستوران خوبی با کیفیت مناسب. قیمت‌ها هم معقول بود.",
      },
      {
        userId: user1.id,
        placeId: place1.id,
        rating: 5,
        comment: "آبشار فوق‌العاده زیبایی! حتماً ببینید.",
      },
      {
        userId: user2.id,
        placeId: place2.id,
        rating: 5,
        comment: "تله‌کابین عالی با منظره خیره‌کننده!",
      },
    ],
  });

  // آپدیت امتیازات
  await prisma.restaurant.update({
    where: { id: restaurant1.id },
    data: { rating: 4.5, reviewCount: 2 },
  });

  await prisma.touristPlace.update({
    where: { id: place1.id },
    data: { rating: 5.0, reviewCount: 1 },
  });

  await prisma.touristPlace.update({
    where: { id: place2.id },
    data: { rating: 5.0, reviewCount: 1 },
  });

  console.log("✅ نظرات ایجاد شدند");

  // ایجاد پیشنهاد نمونه
  await prisma.suggestion.create({
    data: {
      userId: user1.id,
      type: "restaurant",
      status: "pending",
      comment: "رستوران خیلی خوبی پیدا کردم، لطفاً اضافه کنید",
      data: {
        name: "رستوران جنگلی",
        address: "نوشهر، جاده چالوس، کیلومتر 52",
        latitude: 36.6493,
        longitude: 51.4975,
      },
    },
  });

  console.log("✅ پیشنهادات ایجاد شدند");

  console.log("\n🎉 Seed با موفقیت انجام شد!");
  console.log("📊 خلاصه:");
  console.log(`   👥 کاربران: 4 (1 ادمین، 1 صاحب کسب‌وکار، 2 کاربر عادی)`);
  console.log(`   🗂️  دسته‌بندی: 2`);
  console.log(`   🍽️  رستوران‌ها: 3`);
  console.log(`   🏞️  مکان‌های گردشگری: 4`);
  console.log(`   ⭐ نظرات: 4`);
  console.log(`   💡 پیشنهادات: 1`);
  console.log("\n📝 اطلاعات ورود:");
  console.log(`   ادمین: 09121941532 (OTP: 123456)`);
  console.log(`   صاحب کسب‌وکار: 09129876543 (OTP: 123456)`);
  console.log(`   کاربر عادی: 09131112222 (OTP: 123456)`);
}

main()
  .catch((e) => {
    console.error("❌ خطا در seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
