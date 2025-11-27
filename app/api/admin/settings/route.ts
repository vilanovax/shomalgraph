import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SettingCategory } from "@prisma/client";

// GET: دریافت تنظیمات
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const settings = await db.setting.findMany({
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}

// POST: ذخیره تنظیمات
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
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: "فرمت داده نامعتبر" },
        { status: 400 }
      );
    }

    // ذخیره یا به‌روزرسانی هر تنظیم
    const results = await Promise.all(
      settings.map(async (setting: { key: string; value: string; category: string; description?: string; isSecret?: boolean }) => {
        // تبدیل string به enum
        let categoryEnum: SettingCategory = SettingCategory.GENERAL;
        try {
          categoryEnum = setting.category as SettingCategory;
          // بررسی معتبر بودن enum
          if (!Object.values(SettingCategory).includes(categoryEnum)) {
            categoryEnum = SettingCategory.GENERAL;
          }
        } catch {
          categoryEnum = SettingCategory.GENERAL;
        }

        return db.setting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value || null,
            category: categoryEnum,
            description: setting.description || null,
            isSecret: setting.isSecret || false,
          },
          create: {
            key: setting.key,
            value: setting.value || null,
            category: categoryEnum,
            description: setting.description || null,
            isSecret: setting.isSecret || false,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "تنظیمات با موفقیت ذخیره شد",
      count: results.length,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ذخیره تنظیمات" },
      { status: 500 }
    );
  }
}

