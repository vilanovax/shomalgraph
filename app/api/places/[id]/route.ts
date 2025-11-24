import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PlaceType, SuitableFor } from "@prisma/client";

// GET: جزئیات یک مکان گردشگری
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const place = await db.touristPlace.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json(
        { success: false, error: "مکان یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("Error fetching place:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات مکان" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش مکان گردشگری
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const place = await db.touristPlace.findUnique({
      where: { id },
    });

    if (!place) {
      return NextResponse.json(
        { success: false, error: "مکان یافت نشد" },
        { status: 404 }
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
      isActive,
    } = body;

    const updatedPlace = await db.touristPlace.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        placeType: placeType
          ? (placeType as PlaceType)
          : undefined,
        suitableFor: suitableFor
          ? (suitableFor as SuitableFor[])
          : undefined,
        isFree: isFree !== undefined ? isFree : undefined,
        entryFee: entryFee ? parseFloat(entryFee) : null,
        categoryId,
        images,
        workingHours,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlace,
      message: "مکان با موفقیت ویرایش شد",
    });
  } catch (error: unknown) {
    console.error("Error updating place:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "مکانی با این نام قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ویرایش مکان" },
      { status: 500 }
    );
  }
}

// DELETE: حذف مکان گردشگری
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "فقط ادمین می‌تواند مکان را حذف کند" },
        { status: 401 }
      );
    }

    await db.touristPlace.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "مکان با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting place:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف مکان" },
      { status: 500 }
    );
  }
}

