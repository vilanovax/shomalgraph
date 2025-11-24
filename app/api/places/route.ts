import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma, PlaceType, SuitableFor } from "@prisma/client";

// GET: لیست مکان‌های گردشگری
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeType = searchParams.get("placeType");
    const suitableFor = searchParams.get("suitableFor");
    const isFree = searchParams.get("isFree");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.TouristPlaceWhereInput = {
      isActive: true,
    };

    if (placeType && Object.values(PlaceType).includes(placeType as PlaceType)) {
      where.placeType = placeType as PlaceType;
    }

    if (suitableFor && Object.values(SuitableFor).includes(suitableFor as SuitableFor)) {
      where.suitableFor = {
        has: suitableFor as SuitableFor,
      };
    }

    if (isFree !== null) {
      where.isFree = isFree === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [places, total] = await Promise.all([
      db.touristPlace.findMany({
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
      db.touristPlace.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: places,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت مکان‌ها" },
      { status: 500 }
    );
  }
}

// POST: افزودن مکان گردشگری جدید
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
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
      placeType,
      suitableFor,
      isFree,
      entryFee,
      categoryId,
      images,
      workingHours,
    } = body;

    // Validation
    if (!name || !address || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "فیلدهای اجباری را پر کنید" },
        { status: 400 }
      );
    }

    const place = await db.touristPlace.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        placeType: placeType || "OTHER",
        suitableFor: suitableFor || [],
        isFree: isFree !== undefined ? isFree : true,
        entryFee: entryFee ? parseFloat(entryFee) : null,
        categoryId,
        images: images || [],
        workingHours,
        isVerified: true,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: place,
      message: "مکان با موفقیت اضافه شد",
    });
  } catch (error: unknown) {
    console.error("Error creating place:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "مکانی با این نام قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در افزودن مکان" },
      { status: 500 }
    );
  }
}
