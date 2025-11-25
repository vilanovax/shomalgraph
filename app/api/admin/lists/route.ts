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

    console.log("Create list request body:", { title, description, slug, coverImage, keywords });

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "عنوان و slug اجباری است" },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر در دیتابیس
    let user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      // اگر کاربر با id پیدا نشد، با phone جستجو می‌کنیم
      if (session.user.phone) {
        user = await db.user.findUnique({
          where: { phone: session.user.phone },
          select: { id: true },
        });
        
        // اگر هنوز پیدا نشد، کاربر جدید ایجاد می‌کنیم
        if (!user) {
          console.log("User not found, creating new user with phone:", session.user.phone);
          try {
            user = await db.user.create({
              data: {
                phone: session.user.phone,
                name: session.user.name || null,
                role: session.user.role || "ADMIN",
              },
              select: { id: true },
            });
            console.log("User created successfully:", user.id);
          } catch (createError) {
            console.error("Error creating user:", createError);
            return NextResponse.json(
              { success: false, error: "خطا در ایجاد کاربر" },
              { status: 500 }
            );
          }
        }
      }
    }

    if (!user) {
      console.error("User not found in database:", {
        id: session.user.id,
        phone: session.user.phone,
      });
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد. لطفاً دوباره وارد شوید." },
        { status: 404 }
      );
    }

    console.log("User found/created:", user.id);

    const list = await db.list.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        slug: slug.trim(),
        coverImage: coverImage || null,
        keywords: Array.isArray(keywords) ? keywords : [],
        type: "PUBLIC",
        createdById: user.id,
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
    const errorMessage =
      error instanceof Error ? error.message : "خطا در ایجاد لیست";

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
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

