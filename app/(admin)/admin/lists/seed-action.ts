"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function seedLists() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "دسترسی غیرمجاز",
      };
    }

    // بررسی وجود کاربر در دیتابیس
    let user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user && session.user.phone) {
      user = await db.user.findUnique({
        where: { phone: session.user.phone },
        select: { id: true },
      });
    }

    if (!user) {
      return {
        success: false,
        error: "کاربر یافت نشد",
      };
    }

    // دریافت رستوران‌ها و مکان‌های گردشگری
    const restaurants = await db.restaurant.findMany({
      where: { isActive: true },
      select: { id: true },
      take: 20,
    });

    const places = await db.touristPlace.findMany({
      where: { isActive: true },
      select: { id: true },
      take: 20,
    });

    const allItems = [
      ...restaurants.map((r) => ({ type: "restaurant" as const, id: r.id })),
      ...places.map((p) => ({ type: "place" as const, id: p.id })),
    ];

    if (allItems.length < 4) {
      return {
        success: false,
        error: "تعداد آیتم‌های موجود کافی نیست (حداقل 4 آیتم نیاز است)",
      };
    }

    // لیست‌های نمونه
    const sampleLists = [
      {
        title: "بهترین رستوران‌های ساحلی",
        description: "مجموعه‌ای از بهترین رستوران‌های کنار دریا در شمال ایران",
        slug: "best-beach-restaurants",
        keywords: ["رستوران", "ساحل", "دریا", "غذای دریایی"],
      },
      {
        title: "مکان‌های دیدنی چالوس",
        description: "جاذبه‌های گردشگری و مکان‌های دیدنی شهر چالوس",
        slug: "chalus-attractions",
        keywords: ["چالوس", "گردشگری", "دیدنی", "جاذبه"],
      },
      {
        title: "رستوران‌های لوکس و مجلل",
        description: "رستوران‌های با کیفیت و لوکس برای تجربه‌ای خاص",
        slug: "luxury-restaurants",
        keywords: ["لوکس", "مجلل", "رستوران", "کیفیت"],
      },
      {
        title: "طبیعت و کوهستان",
        description: "مکان‌های طبیعی و کوهستانی برای علاقه‌مندان به طبیعت",
        slug: "nature-mountains",
        keywords: ["طبیعت", "کوهستان", "پیاده‌روی", "طبیعت‌گردی"],
      },
      {
        title: "بهترین‌های رامسر",
        description: "مجموعه‌ای از بهترین رستوران‌ها و مکان‌های گردشگری رامسر",
        slug: "best-ramsar",
        keywords: ["رامسر", "بهترین", "گردشگری", "رستوران"],
      },
    ];

    const createdLists = [];

    for (const listData of sampleLists) {
      // بررسی اینکه آیا لیست با این slug قبلاً ایجاد شده
      const existingList = await db.list.findUnique({
        where: { slug: listData.slug },
        select: { id: true },
      });

      if (existingList) {
        console.log(`لیست با slug "${listData.slug}" قبلاً ایجاد شده است، رد می‌شود`);
        continue;
      }

      // انتخاب تصادفی 4 تا 7 آیتم
      const itemCount = Math.floor(Math.random() * 4) + 4; // 4 تا 7
      const shuffled = [...allItems].sort(() => Math.random() - 0.5);
      const selectedItems = shuffled.slice(0, itemCount);

      // ایجاد لیست
      const list = await db.list.create({
        data: {
          title: listData.title,
          description: listData.description,
          slug: listData.slug,
          keywords: listData.keywords,
          type: "PUBLIC",
          createdById: user.id,
          items: {
            create: selectedItems.map((item, index) => ({
              restaurantId: item.type === "restaurant" ? item.id : null,
              placeId: item.type === "place" ? item.id : null,
              order: index,
            })),
          },
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      createdLists.push(list);
    }

    return {
      success: true,
      message: `${createdLists.length} لیست نمونه با موفقیت ایجاد شد`,
      data: createdLists,
    };
  } catch (error: unknown) {
    console.error("Error seeding lists:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "خطا در ایجاد لیست‌های نمونه",
    };
  }
}

