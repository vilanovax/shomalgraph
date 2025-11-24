import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: جزئیات یک رستوران
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "رستوران یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات رستوران" },
      { status: 500 }
    );
  }
}

// PUT: ویرایش رستوران
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "رستوران یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی دسترسی
    const canEdit =
      session.user.role === "ADMIN" ||
      (session.user.role === "BUSINESS_OWNER" &&
        restaurant.ownerId === session.user.id);

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: "شما مجاز به ویرایش این رستوران نیستید" },
        { status: 403 }
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
      isActive,
    } = body;

    const updatedRestaurant = await db.restaurant.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        phone,
        priceRange,
        categoryId,
        images,
        menuImages,
        workingHours,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRestaurant,
      message: "رستوران با موفقیت ویرایش شد",
    });
  } catch (error: unknown) {
    console.error("Error updating restaurant:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "رستورانی با این نام قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ویرایش رستوران" },
      { status: 500 }
    );
  }
}

// DELETE: حذف رستوران
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "فقط ادمین می‌تواند رستوران را حذف کند" },
        { status: 401 }
      );
    }

    await db.restaurant.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "رستوران با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف رستوران" },
      { status: 500 }
    );
  }
}
