import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: لیست دسته‌بندی‌ها
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}
