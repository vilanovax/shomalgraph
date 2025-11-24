import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma, PlaceType, RestaurantPriceRange } from "@prisma/client";

// GET: جستجو و فیلتر آیتم‌ها (رستوران‌ها و مکان‌ها)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type"); // "restaurant" | "place" | "all"
    const placeType = searchParams.get("placeType");
    const priceRange = searchParams.get("priceRange");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const results: {
      restaurants: unknown[];
      places: unknown[];
    } = {
      restaurants: [],
      places: [],
    };

    // جستجوی رستوران‌ها
    if (type === "all" || type === "restaurant" || !type) {
      const restaurantWhere: Prisma.RestaurantWhereInput = {
        isActive: true,
      };

      if (search) {
        restaurantWhere.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (priceRange && Object.values(RestaurantPriceRange).includes(priceRange as RestaurantPriceRange)) {
        restaurantWhere.priceRange = priceRange as RestaurantPriceRange;
      }

      const restaurants = await db.restaurant.findMany({
        where: restaurantWhere,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          rating: "desc",
        },
      });

      results.restaurants = restaurants;
    }

    // جستجوی مکان‌ها
    if (type === "all" || type === "place" || !type) {
      const placeWhere: Prisma.TouristPlaceWhereInput = {
        isActive: true,
      };

      if (search) {
        placeWhere.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (placeType && Object.values(PlaceType).includes(placeType as PlaceType)) {
        placeWhere.placeType = placeType as PlaceType;
      }

      const places = await db.touristPlace.findMany({
        where: placeWhere,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          rating: "desc",
        },
      });

      results.places = places;
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching items:", error);
    return NextResponse.json(
      { success: false, error: "خطا در جستجو" },
      { status: 500 }
    );
  }
}

