import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  generateQuickPlan,
  generateDailyPlan,
  generateTripPlan,
} from "@/lib/ai/travel-planner";
import type {
  PlanType,
  TravelType,
  AvailableTime,
  Budget,
  TravelStyle,
  PlanItemType,
} from "@prisma/client";

// POST: ایجاد برنامه سفر
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // بررسی وجود db.travelPlanItem
    if (!db.travelPlanItem) {
      console.error("db.travelPlanItem is undefined. Prisma Client may need to be regenerated.");
      return NextResponse.json(
        {
          success: false,
          error: "خطا در اتصال به دیتابیس. لطفاً سرور را restart کنید.",
        },
        { status: 500 }
      );
    }
    const {
      planType,
      location,
      searchRadius,
      travelType,
      availableTime,
      travelStyle,
      startDate,
      endDate,
      startTime,
      endTime,
      budget,
      interests,
      preferences,
    } = body;

    if (!planType || !location) {
      return NextResponse.json(
        { success: false, error: "نوع برنامه و موقعیت الزامی است" },
        { status: 400 }
      );
    }

    // ایجاد برنامه در دیتابیس
    const plan = await db.travelPlan.create({
      data: {
        userId: session.user.id,
        planType: planType as PlanType,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        searchRadius: searchRadius || 5,
        travelType: travelType ? (travelType as TravelType) : null,
        availableTime: availableTime
          ? (availableTime as AvailableTime)
          : null,
        travelStyle: travelStyle ? (travelStyle as TravelStyle) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        budget: budget ? (budget as Budget) : null,
        interests: interests ? JSON.parse(JSON.stringify(interests)) : null,
        preferences: preferences
          ? JSON.parse(JSON.stringify(preferences))
          : null,
        status: "DRAFT",
      },
    });

    let items: Array<{
      restaurantId?: string;
      placeId?: string;
      order: number;
      dayNumber: number;
      timeSlot: string | null;
      notes: string | null;
      tips: string | null;
      isCompleted: boolean;
    }> = [];

    // تولید برنامه بر اساس نوع
    if (planType === "QUICK") {
      if (!travelType || !availableTime) {
        return NextResponse.json(
          { success: false, error: "نوع سفر و زمان موجود الزامی است" },
          { status: 400 }
        );
      }

      const quickItems = await generateQuickPlan({
        location,
        travelType: travelType as TravelType,
        availableTime: availableTime as AvailableTime,
      });

      if (!quickItems || quickItems.length === 0) {
        // اگر آیتمی پیدا نشد، برنامه را حذف می‌کنیم
        await db.travelPlan.delete({ where: { id: plan.id } });
        return NextResponse.json(
          {
            success: false,
            error: "هیچ آیتمی در محدوده انتخابی یافت نشد. لطفاً محدوده جستجو را افزایش دهید.",
          },
          { status: 404 }
        );
      }

      // ذخیره آیتم‌ها
      items = await Promise.all(
        quickItems.map((item, index) => {
          const itemType: PlanItemType =
            item.type === "restaurant" ? "RESTAURANT" : "PLACE";
          
          return db.travelPlanItem.create({
            data: {
              planId: plan.id,
              order: index + 1,
              itemType,
              restaurantId:
                item.type === "restaurant" ? item.id : null,
              placeId: item.type === "place" ? item.id : null,
              duration: 60, // پیش‌فرض
              distance: item.distance || null,
              notes: item.tips || null,
            },
          });
        })
      );
    } else if (planType === "DAILY") {
      if (!travelType || !startTime || !endTime) {
        return NextResponse.json(
          {
            success: false,
            error: "نوع سفر و بازه زمانی الزامی است",
          },
          { status: 400 }
        );
      }

      const dailyItems = await generateDailyPlan({
        location,
        searchRadius: searchRadius || 20,
        travelType: travelType as TravelType,
        startTime,
        endTime,
        budget: budget ? (budget as Budget) : undefined,
        interests: interests || [],
      });

      if (!dailyItems || dailyItems.length === 0) {
        // اگر آیتمی پیدا نشد، برنامه را حذف می‌کنیم
        await db.travelPlan.delete({ where: { id: plan.id } });
        return NextResponse.json(
          {
            success: false,
            error: "هیچ آیتمی در محدوده انتخابی یافت نشد. لطفاً محدوده جستجو را افزایش دهید یا علایق خود را تغییر دهید.",
          },
          { status: 404 }
        );
      }

      // ذخیره آیتم‌ها با زمان‌بندی
      items = await Promise.all(
        dailyItems.map((item) => {
          const itemType: PlanItemType =
            item.type === "restaurant" ? "RESTAURANT" : "PLACE";
          
          return db.travelPlanItem.create({
            data: {
              planId: plan.id,
              order: item.order,
              timeSlot: item.timeSlot || null,
              scheduledTime: item.scheduledTime || null,
              duration: item.duration || 60,
              itemType,
              restaurantId:
                item.type === "restaurant" ? item.id : null,
              placeId: item.type === "place" ? item.id : null,
              travelDuration: item.travelTime || null,
              distance: item.distance || null,
              notes: item.tips || null,
            },
          });
        })
      );
    } else if (planType === "TRIP") {
      if (!travelType || !travelStyle || !startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: "نوع سفر، سبک سفر و تاریخ‌ها الزامی است",
          },
          { status: 400 }
        );
      }

      const tripPlan = await generateTripPlan({
        location,
        searchRadius: searchRadius || 30,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelType: travelType as TravelType,
        travelStyle: travelStyle as TravelStyle,
        budget: budget ? (budget as Budget) : undefined,
        preferences: preferences || {},
        interests: interests || [],
      });

      // ذخیره آیتم‌ها برای هر روز
      for (const [dayNumber, dayItems] of tripPlan.entries()) {
        const dayItemsData = await Promise.all(
          dayItems.map((item) =>
            db.travelPlanItem.create({
              data: {
                planId: plan.id,
                order: item.order,
                dayNumber,
                timeSlot: item.timeSlot || null,
                scheduledTime: item.scheduledTime || null,
                duration: item.duration,
                itemType:
                  item.type === "restaurant"
                    ? ("RESTAURANT" as PlanItemType)
                    : ("PLACE" as PlanItemType),
                restaurantId:
                  item.type === "restaurant" ? item.id : null,
                placeId: item.type === "place" ? item.id : null,
                travelDuration: item.travelTime,
                distance: item.distance,
                notes: item.tips,
              },
            })
          )
        );
        items.push(...dayItemsData);
      }
    }

    // محاسبه خلاصه برنامه
    let totalDistance = 0;
    let totalDuration = 0;
    let estimatedCost = 0;

    for (const item of items) {
      if (item.distance) totalDistance += item.distance;
      if (item.duration) totalDuration += item.duration;
      if (item.travelDuration) totalDuration += item.travelDuration;

      // محاسبه هزینه (تقریبی)
      if (item.restaurantId) {
        const restaurant = await db.restaurant.findUnique({
          where: { id: item.restaurantId },
          select: { priceRange: true },
        });
        if (restaurant) {
          const costMap: Record<string, number> = {
            BUDGET: 200000,
            MODERATE: 400000,
            EXPENSIVE: 700000,
            LUXURY: 1200000,
          };
          estimatedCost += costMap[restaurant.priceRange] || 400000;
        }
      } else if (item.placeId) {
        const place = await db.touristPlace.findUnique({
          where: { id: item.placeId },
          select: { entryFee: true, isFree: true },
        });
        if (place && !place.isFree && place.entryFee) {
          estimatedCost += place.entryFee;
        }
      }
    }

    // به‌روزرسانی خلاصه برنامه
    const updatedPlan = await db.travelPlan.update({
      where: { id: plan.id },
      data: {
        totalDistance,
        totalDuration,
        estimatedCost,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
                _count: {
                  select: {
                    reviews: true,
                  },
                },
              },
            },
            place: {
              include: {
                category: true,
                _count: {
                  select: {
                    reviews: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: "برنامه با موفقیت ایجاد شد",
    });
  } catch (error: unknown) {
    console.error("Error creating travel plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "خطا در ایجاد برنامه";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

