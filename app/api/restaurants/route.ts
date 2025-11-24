import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma, RestaurantPriceRange } from "@prisma/client";

// GET: لیست رستوران‌ها
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const priceRange = searchParams.get("priceRange");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.RestaurantWhereInput = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (priceRange && Object.values(RestaurantPriceRange).includes(priceRange as RestaurantPriceRange)) {
      where.priceRange = priceRange as RestaurantPriceRange;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      db.restaurant.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          rating: "desc",
        },
        take: limit,
        skip: offset,
      }),
      db.restaurant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: restaurants,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت رستوران‌ها" },
      { status: 500 }
    );
  }
}

// POST: افزودن رستوران جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_OWNER")) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      address,
      latitude,
      longitude,
      phone,
      priceRange,
      categoryId,
      images,
      menuImages,
      workingHours,
    } = body;

    // Validation
    if (!name || !address || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "فیلدهای اجباری را پر کنید" },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        phone,
        priceRange: priceRange || "MODERATE",
        categoryId,
        images: images || [],
        menuImages: menuImages || [],
        workingHours,
        ownerId: session.user.role === "BUSINESS_OWNER" ? session.user.id : undefined,
        isVerified: session.user.role === "ADMIN",
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: restaurant,
      message: "رستوران با موفقیت اضافه شد",
    });
  } catch (error: unknown) {
    console.error("Error creating restaurant:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "رستورانی با این نام قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در افزودن رستوران" },
      { status: 500 }
    );
  }
}
