import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 شروع seed کردن دیتابیس...");

  // حذف دیتاهای قبلی (به ترتیب وابستگی)
  await prisma.commentReportNew.deleteMany();
  await prisma.commentLikeNew.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.badWord.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklistTemplateItem.deleteMany();
  await prisma.travelChecklist.deleteMany();
  await prisma.travelChecklistTemplate.deleteMany();
  await prisma.travelPlanItem.deleteMany();
  await prisma.travelPlan.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.listItem.deleteMany();
  await prisma.list.deleteMany();
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

  // ایجاد 10 رستوران نمونه
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: "رستوران کوهستان",
        slug: "restaurant-kohestan",
        description: "رستوران سنتی با منوی غذاهای محلی شمالی و فضای دنج و آرامش‌بخش",
        address: "مازندران، رامسر، جاده ساحلی، کیلومتر 5",
        latitude: 36.9025,
        longitude: 50.6481,
        phone: "011-55223344",
        priceRange: "MODERATE",
        rating: 4.5,
        reviewCount: 23,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "کافه ساحل",
        slug: "cafe-sahel",
        description: "کافه مدرن با نمای رو به دریا و نوشیدنی‌های خوشمزه و دسرهای خاص",
        address: "گیلان، رشت، بلوار ساحلی انزلی، پلاک 120",
        latitude: 37.4717,
        longitude: 49.4648,
        phone: "013-33221100",
        priceRange: "BUDGET",
        rating: 4.2,
        reviewCount: 15,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "رستوران دریایی ماهی‌گیر",
        slug: "restaurant-mahigir",
        description: "رستوران تخصصی غذاهای دریایی با ماهی تازه روز و طعم‌های بی‌نظیر",
        address: "مازندران، نوشهر، خیابان ساحلی، نزدیک اسکله",
        latitude: 36.6481,
        longitude: 51.5000,
        phone: "011-44225566",
        priceRange: "EXPENSIVE",
        rating: 4.8,
        reviewCount: 42,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "کافه جنگل",
        slug: "cafe-jangal",
        description: "کافه در دل طبیعت با فضای باز و منوی صبحانه و ناهار کامل",
        address: "گیلان، لاهیجان، جاده جنگل، کیلومتر 8",
        latitude: 37.2049,
        longitude: 50.0094,
        phone: "014-22334455",
        priceRange: "MODERATE",
        rating: 4.3,
        reviewCount: 18,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "رستوران لوکس ویلا",
        slug: "restaurant-vila-luxury",
        description: "رستوران لاکچری با منوی بین‌المللی و فضای مجلل و سرویس عالی",
        address: "مازندران، بابلسر، بلوار ساحلی، هتل ویلا",
        latitude: 36.7022,
        longitude: 52.6578,
        phone: "011-66778899",
        priceRange: "LUXURY",
        rating: 4.9,
        reviewCount: 67,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "رستوران محلی شمالی",
        slug: "restaurant-mahali-shomali",
        description: "رستوران با غذاهای محلی اصیل شمالی و محیطی سنتی و صمیمی",
        address: "مازندران، آمل، خیابان اصلی، پلاک 45",
        latitude: 36.4694,
        longitude: 52.3508,
        phone: "011-33445566",
        priceRange: "BUDGET",
        rating: 4.4,
        reviewCount: 31,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "کافه کتابخانه",
        slug: "cafe-ketabkhane",
        description: "کافه کتاب با فضای آرام و مناسب برای مطالعه و کار",
        address: "گیلان، رشت، خیابان فرهنگ، کافه کتابخانه",
        latitude: 37.2808,
        longitude: 49.5832,
        phone: "013-22334455",
        priceRange: "MODERATE",
        rating: 4.6,
        reviewCount: 28,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "رستوران کبابی آتش",
        slug: "restaurant-kababi-atesh",
        description: "رستوران تخصصی کباب با گوشت تازه و کباب‌های خوشمزه",
        address: "مازندران، ساری، بلوار طالقانی، رستوران کبابی آتش",
        latitude: 36.5633,
        longitude: 53.0581,
        phone: "011-77889900",
        priceRange: "MODERATE",
        rating: 4.7,
        reviewCount: 55,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "کافه رستوران بامبو",
        slug: "cafe-restaurant-bamboo",
        description: "کافه رستوران مدرن با منوی متنوع و فضای دنج",
        address: "گیلان، انزلی، بلوار ساحلی، کافه بامبو",
        latitude: 37.4731,
        longitude: 49.4578,
        phone: "013-44556677",
        priceRange: "MODERATE",
        rating: 4.5,
        reviewCount: 39,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "رستوران ایتالیایی پیتزا",
        slug: "restaurant-italian-pizza",
        description: "رستوران ایتالیایی با پیتزاهای خوشمزه و پاستاهای تازه",
        address: "مازندران، چالوس، خیابان ساحلی، رستوران ایتالیایی",
        latitude: 36.6550,
        longitude: 51.4200,
        phone: "011-88990011",
        priceRange: "EXPENSIVE",
        rating: 4.8,
        reviewCount: 72,
        categoryId: restaurantCategory.id,
        ownerId: businessOwner.id,
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log("✅ 10 رستوران ایجاد شدند");

  // ایجاد 10 مکان گردشگری نمونه
  const places = await Promise.all([
    prisma.touristPlace.create({
      data: {
        name: "جنگل ابر",
        slug: "jangal-abar",
        description: "جنگل زیبای ابر با درختان سرسبز و هوای خنک و مطبوع",
        address: "مازندران، شاهرود، جاده جنگل ابر",
        latitude: 36.6333,
        longitude: 54.8500,
        placeType: "FOREST",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.8,
        reviewCount: 156,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "آبشار لاتون",
        slug: "abshar-latun",
        description: "آبشار بلند و زیبای لاتون با طبیعت بکر و چشم‌انداز خیره‌کننده",
        address: "گیلان، آستارا، جاده لاتون، آبشار لاتون",
        latitude: 38.4333,
        longitude: 48.8667,
        placeType: "WATERFALL",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.7,
        reviewCount: 89,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "ساحل چمخاله",
        slug: "sahel-chamkhale",
        description: "ساحل زیبا و آرام چمخاله با شن‌های طلایی و آب شفاف",
        address: "گیلان، لنگرود، ساحل چمخاله",
        latitude: 37.1833,
        longitude: 50.1500,
        placeType: "BEACH",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE", "KIDS"],
        rating: 4.6,
        reviewCount: 124,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "کوه دماوند",
        slug: "kuh-damavand",
        description: "بلندترین قله ایران با مناظر طبیعی بی‌نظیر و هوای پاک",
        address: "مازندران، آمل، جاده دماوند",
        latitude: 35.9517,
        longitude: 52.1083,
        placeType: "MOUNTAIN",
        suitableFor: ["FRIENDS", "SOLO"],
        rating: 4.9,
        reviewCount: 203,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "پارک جنگلی نور",
        slug: "park-jangali-noor",
        description: "پارک جنگلی زیبا با امکانات تفریحی و فضای مناسب برای پیک‌نیک",
        address: "مازندران، نور، پارک جنگلی نور",
        latitude: 36.5833,
        longitude: 52.0167,
        placeType: "PARK",
        suitableFor: ["FAMILY", "FRIENDS", "KIDS"],
        rating: 4.4,
        reviewCount: 67,
        isFree: false,
        entryFee: 50000,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "تالاب انزلی",
        slug: "talab-anzali",
        description: "تالاب زیبا و بزرگ انزلی با قایق‌سواری و طبیعت منحصر به فرد",
        address: "گیلان، انزلی، تالاب انزلی",
        latitude: 37.4667,
        longitude: 49.4667,
        placeType: "NATURE",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.5,
        reviewCount: 178,
        isFree: false,
        entryFee: 100000,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "قلعه رودخان",
        slug: "ghale-rudkhan",
        description: "قلعه تاریخی و باستانی رودخان با معماری منحصر به فرد",
        address: "گیلان، فومن، جاده قلعه رودخان",
        latitude: 37.0667,
        longitude: 49.3167,
        placeType: "HISTORICAL",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.6,
        reviewCount: 145,
        isFree: false,
        entryFee: 80000,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "ساحل رامسر",
        slug: "sahel-ramsar",
        description: "ساحل زیبای رامسر با امکانات تفریحی و رستوران‌های ساحلی",
        address: "مازندران، رامسر، ساحل رامسر",
        latitude: 36.9167,
        longitude: 50.6500,
        placeType: "BEACH",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE", "KIDS"],
        rating: 4.7,
        reviewCount: 234,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "پارک آبی رامسر",
        slug: "park-abi-ramsar",
        description: "پارک آبی با استخر و سرسره‌های آبی و امکانات تفریحی",
        address: "مازندران، رامسر، پارک آبی",
        latitude: 36.9000,
        longitude: 50.6500,
        placeType: "ENTERTAINMENT",
        suitableFor: ["FAMILY", "FRIENDS", "KIDS"],
        rating: 4.3,
        reviewCount: 98,
        isFree: false,
        entryFee: 200000,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "موزه رشت",
        slug: "muze-rasht",
        description: "موزه تاریخی رشت با آثار باستانی و فرهنگی منطقه",
        address: "گیلان، رشت، خیابان امام، موزه رشت",
        latitude: 37.2808,
        longitude: 49.5832,
        placeType: "CULTURAL",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.2,
        reviewCount: 56,
        isFree: false,
        entryFee: 50000,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.touristPlace.create({
      data: {
        name: "آبشار لاتون",
        slug: "abshar-latun-2",
        description: "آبشار زیبا در دل جنگل‌های شمال. مسیر پیاده‌روی و منظره بی‌نظیر.",
        address: "رامسر، جاده کیاسر، روستای لاتون",
        latitude: 36.5659,
        longitude: 50.5282,
        placeType: "WATERFALL",
        suitableFor: ["FAMILY", "FRIENDS", "COUPLE"],
        rating: 4.7,
        reviewCount: 45,
        isFree: true,
        entryFee: null,
        categoryId: tourismCategory.id,
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log("✅ 10 مکان گردشگری ایجاد شدند");

  // ایجاد لیست‌های نمونه
  const allItems = [
    ...restaurants.map((r) => ({ type: "restaurant" as const, id: r.id })),
    ...places.map((p) => ({ type: "place" as const, id: p.id })),
  ];

  // تابع برای انتخاب تصادفی آیتم‌ها
  const getRandomItems = (count: number) => {
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allItems.length));
  };

  const sampleLists = [
    {
      title: "بهترین رستوران‌های ساحلی",
      description: "مجموعه‌ای از بهترین رستوران‌های کنار دریا در شمال ایران",
      slug: "best-beach-restaurants",
      keywords: ["رستوران", "ساحل", "دریا", "غذای دریایی"],
      itemCount: 5,
    },
    {
      title: "مکان‌های دیدنی چالوس",
      description: "جاذبه‌های گردشگری و مکان‌های دیدنی شهر چالوس",
      slug: "chalus-attractions",
      keywords: ["چالوس", "گردشگری", "دیدنی", "جاذبه"],
      itemCount: 6,
    },
    {
      title: "رستوران‌های لوکس و مجلل",
      description: "رستوران‌های با کیفیت و لوکس برای تجربه‌ای خاص",
      slug: "luxury-restaurants",
      keywords: ["لوکس", "مجلل", "رستوران", "کیفیت"],
      itemCount: 4,
    },
    {
      title: "طبیعت و کوهستان",
      description: "مکان‌های طبیعی و کوهستانی برای علاقه‌مندان به طبیعت",
      slug: "nature-mountains",
      keywords: ["طبیعت", "کوهستان", "پیاده‌روی", "طبیعت‌گردی"],
      itemCount: 7,
    },
    {
      title: "بهترین‌های رامسر",
      description: "مجموعه‌ای از بهترین رستوران‌ها و مکان‌های گردشگری رامسر",
      slug: "best-ramsar",
      keywords: ["رامسر", "بهترین", "گردشگری", "رستوران"],
      itemCount: 5,
    },
  ];

  const createdLists = [];

  for (const listData of sampleLists) {
    const selectedItems = getRandomItems(listData.itemCount);

    const list = await prisma.list.create({
      data: {
        title: listData.title,
        description: listData.description,
        slug: listData.slug,
        keywords: listData.keywords,
        type: "PUBLIC",
        createdById: admin.id,
        items: {
          create: selectedItems.map((item, index) => ({
            restaurantId: item.type === "restaurant" ? item.id : null,
            placeId: item.type === "place" ? item.id : null,
            order: index,
          })),
        },
      },
    });

    createdLists.push(list);
  }

  console.log(`✅ ${createdLists.length} لیست نمونه ایجاد شدند`);

  // ایجاد نظرات نمونه
  await prisma.review.createMany({
    data: [
      {
        userId: user1.id,
        restaurantId: restaurants[0].id,
        rating: 5,
        comment: "غذاهای بسیار خوشمزه و محیط دلنشین. حتماً دوباره می‌آیم!",
      },
      {
        userId: user2.id,
        restaurantId: restaurants[0].id,
        rating: 4,
        comment: "رستوران خوبی با کیفیت مناسب. قیمت‌ها هم معقول بود.",
      },
      {
        userId: user1.id,
        placeId: places[0].id,
        rating: 5,
        comment: "جنگل ابر فوق‌العاده زیباست! حتماً ببینید.",
      },
      {
        userId: user2.id,
        placeId: places[1].id,
        rating: 5,
        comment: "آبشار لاتون عالی با منظره خیره‌کننده!",
      },
    ],
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

  // ایجاد قالب‌های چک‌لیست نمونه
  const template1 = await prisma.travelChecklistTemplate.create({
    data: {
      title: "لیست سفر خانوادگی دریا",
      description: "چک‌لیست کامل برای سفر خانوادگی به ساحل",
      icon: "🏖️",
      travelType: "FAMILY_WITH_KIDS",
      season: "SUMMER",
      isActive: true,
      createdById: admin.id,
      items: {
        create: [
          {
            name: "کرم ضد آفتاب",
            description: "ضد آفتاب با SPF بالا برای بزرگسالان و کودکان",
            order: 0,
            isRequired: true,
          },
          {
            name: "کلاه و عینک آفتابی",
            description: "برای محافظت از نور خورشید",
            order: 1,
            isRequired: true,
          },
          {
            name: "لباس شنا",
            description: "برای بزرگسالان و کودکان",
            order: 2,
            isRequired: true,
          },
          {
            name: "حوله ساحلی",
            description: "حوله بزرگ برای استفاده در ساحل",
            order: 3,
            isRequired: true,
          },
          {
            name: "کفش آبی",
            description: "برای راه رفتن روی شن و سنگ",
            order: 4,
            isRequired: false,
          },
          {
            name: "بازی‌های ساحلی",
            description: "توپ، سطل و بیلچه برای کودکان",
            order: 5,
            isRequired: false,
          },
          {
            name: "آب و نوشیدنی",
            description: "آب معدنی و نوشیدنی‌های خنک",
            order: 6,
            isRequired: true,
          },
          {
            name: "میوه و تنقلات",
            description: "میوه و خوراکی‌های سبک",
            order: 7,
            isRequired: false,
          },
          {
            name: "کیسه زباله",
            description: "برای جمع‌آوری زباله‌ها",
            order: 8,
            isRequired: true,
          },
          {
            name: "دوربین عکاسی",
            description: "برای ثبت خاطرات",
            order: 9,
            isRequired: false,
          },
        ],
      },
    },
  });

  const template2 = await prisma.travelChecklistTemplate.create({
    data: {
      title: "لیست سفر طبیعت‌گردی",
      description: "چک‌لیست برای سفر به طبیعت و کوهستان",
      icon: "🏔️",
      travelType: "NATURE",
      season: "ALL",
      isActive: true,
      createdById: admin.id,
      items: {
        create: [
          {
            name: "کفش کوهنوردی",
            description: "کفش مناسب برای پیاده‌روی در طبیعت",
            order: 0,
            isRequired: true,
          },
          {
            name: "کوله پشتی",
            description: "کوله مناسب برای حمل وسایل",
            order: 1,
            isRequired: true,
          },
          {
            name: "آب و نوشیدنی",
            description: "آب کافی برای سفر",
            order: 2,
            isRequired: true,
          },
          {
            name: "غذا و تنقلات",
            description: "غذاهای سبک و انرژی‌زا",
            order: 3,
            isRequired: true,
          },
          {
            name: "کمک‌های اولیه",
            description: "جعبه کمک‌های اولیه",
            order: 4,
            isRequired: true,
          },
          {
            name: "چراغ قوه",
            description: "چراغ قوه یا هد لامپ",
            order: 5,
            isRequired: true,
          },
          {
            name: "لباس اضافی",
            description: "لباس مناسب برای تغییر آب و هوا",
            order: 6,
            isRequired: true,
          },
          {
            name: "نقشه و قطب‌نما",
            description: "برای مسیریابی",
            order: 7,
            isRequired: false,
          },
          {
            name: "کرم دافع حشرات",
            description: "برای محافظت از نیش حشرات",
            order: 8,
            isRequired: false,
          },
          {
            name: "کیسه خواب",
            description: "در صورت اقامت شبانه",
            order: 9,
            isRequired: false,
          },
        ],
      },
    },
  });

  const template3 = await prisma.travelChecklistTemplate.create({
    data: {
      title: "لیست سفر شهری",
      description: "چک‌لیست برای سفر به شهر و بازدید از جاذبه‌های شهری",
      icon: "🏙️",
      travelType: "URBAN",
      season: "ALL",
      isActive: true,
      createdById: admin.id,
      items: {
        create: [
          {
            name: "لباس مناسب",
            description: "لباس مناسب برای بازدید از شهر",
            order: 0,
            isRequired: true,
          },
          {
            name: "کفش راحت",
            description: "کفش مناسب برای پیاده‌روی در شهر",
            order: 1,
            isRequired: true,
          },
          {
            name: "کیف پول و پول نقد",
            description: "پول نقد و کارت بانکی",
            order: 2,
            isRequired: true,
          },
          {
            name: "دوربین یا موبایل",
            description: "برای عکاسی",
            order: 3,
            isRequired: false,
          },
          {
            name: "نقشه شهر",
            description: "نقشه یا اپلیکیشن مسیریابی",
            order: 4,
            isRequired: false,
          },
          {
            name: "بلیط‌های بازدید",
            description: "بلیط موزه‌ها و جاذبه‌ها",
            order: 5,
            isRequired: false,
          },
          {
            name: "آب و تنقلات",
            description: "آب و خوراکی‌های سبک",
            order: 6,
            isRequired: false,
          },
        ],
      },
    },
  });

  console.log("✅ قالب‌های چک‌لیست ایجاد شدند");

  // ایجاد کلمات بد نمونه
  const badWords = await Promise.all([
    prisma.badWord.create({
      data: {
        word: "فحش",
        severity: "SEVERE",
        isActive: true,
      },
    }),
    prisma.badWord.create({
      data: {
        word: "بد",
        severity: "MILD",
        isActive: true,
      },
    }),
    prisma.badWord.create({
      data: {
        word: "ناسزا",
        severity: "MODERATE",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${badWords.length} کلمه بد نمونه ایجاد شدند`);

  // ایجاد تنظیمات امتیازدهی کامنت‌ها
  const commentScoreSettings = [
    { key: "bad_words_penalty", value: "-5", description: "امتیاز منفی برای استفاده از کلمات بد" },
    { key: "report_penalty", value: "-3", description: "امتیاز منفی برای هر ریپورت" },
    { key: "deleted_by_admin_penalty", value: "-10", description: "امتیاز منفی برای حذف کامنت توسط ادمین" },
    { key: "like_bonus", value: "1", description: "امتیاز مثبت برای هر لایک" },
    { key: "ban_threshold_1", value: "-10", description: "آستانه اول برای ممنوعیت (1 روز)" },
    { key: "ban_threshold_2", value: "-15", description: "آستانه دوم برای ممنوعیت (3 روز)" },
    { key: "ban_threshold_3", value: "-20", description: "آستانه سوم برای ممنوعیت (7 روز + ممنوعیت مکان)" },
    { key: "ban_days_1", value: "1", description: "تعداد روز ممنوعیت برای آستانه اول" },
    { key: "ban_days_2", value: "3", description: "تعداد روز ممنوعیت برای آستانه دوم" },
    { key: "ban_days_3", value: "7", description: "تعداد روز ممنوعیت برای آستانه سوم" },
    { key: "place_ban_days", value: "30", description: "تعداد روز ممنوعیت اضافه کردن مکان" },
  ];

  await prisma.setting.createMany({
    data: commentScoreSettings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      category: "COMMENT_SCORES" as const,
      description: setting.description,
      isSecret: false,
    })),
  });

  console.log(`✅ ${commentScoreSettings.length} تنظیمات امتیازدهی ایجاد شدند`);

  // ایجاد کامنت‌های نمونه
  const sampleComments = [
    {
      userId: user1.id,
      itemType: "RESTAURANT" as const,
      restaurantId: restaurants[0].id,
      content: "رستوران عالی با غذاهای خوشمزه! حتماً دوباره می‌آیم.",
      censoredContent: "رستوران عالی با غذاهای خوشمزه! حتماً دوباره می‌آیم.",
      hasBadWords: false,
      status: "ACTIVE" as const,
      likeCount: 5,
      reportCount: 0,
    },
    {
      userId: user2.id,
      itemType: "RESTAURANT" as const,
      restaurantId: restaurants[0].id,
      content: "کیفیت غذا خوب بود ولی قیمت‌ها کمی بالا بود.",
      censoredContent: "کیفیت غذا خوب بود ولی قیمت‌ها کمی بالا بود.",
      hasBadWords: false,
      status: "ACTIVE" as const,
      likeCount: 3,
      reportCount: 0,
    },
    {
      userId: user1.id,
      itemType: "PLACE" as const,
      placeId: places[0].id,
      content: "جنگل ابر واقعاً زیباست! هوای خنک و طبیعت بکر.",
      censoredContent: "جنگل ابر واقعاً زیباست! هوای خنک و طبیعت بکر.",
      hasBadWords: false,
      status: "ACTIVE" as const,
      likeCount: 8,
      reportCount: 0,
    },
    {
      userId: user2.id,
      itemType: "PLACE" as const,
      placeId: places[1].id,
      content: "آبشار لاتون عالی بود. مسیر پیاده‌روی هم خوب بود.",
      censoredContent: "آبشار لاتون عالی بود. مسیر پیاده‌روی هم خوب بود.",
      hasBadWords: false,
      status: "ACTIVE" as const,
      likeCount: 6,
      reportCount: 0,
    },
  ];

  const createdComments = await Promise.all(
    sampleComments.map((comment) =>
      prisma.comment.create({
        data: comment,
      })
    )
  );

  console.log(`✅ ${createdComments.length} کامنت نمونه ایجاد شدند`);

  console.log("\n🎉 Seed با موفقیت انجام شد!");
  console.log("📊 خلاصه:");
  console.log(`   👥 کاربران: 4 (1 ادمین، 1 صاحب کسب‌وکار، 2 کاربر عادی)`);
  console.log(`   🗂️  دسته‌بندی: 2`);
  console.log(`   🍽️  رستوران‌ها: ${restaurants.length}`);
  console.log(`   🏞️  مکان‌های گردشگری: ${places.length}`);
  console.log(`   📝 لیست‌ها: ${createdLists.length}`);
  console.log(`   ⭐ نظرات: 4`);
  console.log(`   💡 پیشنهادات: 1`);
  console.log(`   📋 قالب‌های چک‌لیست: 3`);
  console.log(`   💬 کامنت‌ها: ${createdComments.length}`);
  console.log(`   🚫 کلمات بد: ${badWords.length}`);
  console.log(`   ⚙️  تنظیمات: ${commentScoreSettings.length}`);
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
