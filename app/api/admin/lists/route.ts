import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: لیست همه لیست‌ها (برای ادمین)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const lists = await db.list.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست‌ها" },
      { status: 500 }
    );
  }
}

// POST: ایجاد لیست جدید
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
    const { title, description, slug, coverImage, keywords } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "عنوان و slug اجباری است" },
        { status: 400 }
      );
    }

    const list = await db.list.create({
      data: {
        title,
        description,
        slug,
        coverImage,
        keywords: keywords || [],
        type: "PUBLIC",
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: list,
      message: "لیست با موفقیت ایجاد شد",
    });
  } catch (error: unknown) {
    console.error("Error creating list:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "لیستی با این slug قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ایجاد لیست" },
      { status: 500 }
    );
  }
}

