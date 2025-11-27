import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: دریافت لیست کلمات بد
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const where: { isActive?: boolean } = {};
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const badWords = await db.badWord.findMany({
      where,
      orderBy: [
        { severity: "asc" },
        { word: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: badWords,
    });
  } catch (error: unknown) {
    console.error("Error fetching bad words:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت کلمات بد" },
      { status: 500 }
    );
  }
}

// POST: ایجاد کلمه بد جدید
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
    const { word, severity, isActive } = body;

    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "کلمه اجباری است" },
        { status: 400 }
      );
    }

    // بررسی تکراری بودن
    const existing = await db.badWord.findUnique({
      where: { word: word.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "این کلمه قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const badWord = await db.badWord.create({
      data: {
        word: word.trim().toLowerCase(),
        severity: (severity || "MODERATE") as "MILD" | "SEVERE" | "MODERATE",
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      data: badWord,
      message: "کلمه با موفقیت اضافه شد",
    });
  } catch (error: unknown) {
    console.error("Error creating bad word:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ایجاد کلمه" },
      { status: 500 }
    );
  }
}

