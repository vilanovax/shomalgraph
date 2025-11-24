import { db } from "../lib/db";

async function makeAdmin(phone: string) {
  try {
    const user = await db.user.update({
      where: { phone },
      data: { role: "ADMIN" },
    });

    console.log("✅ کاربر با موفقیت به ادمین تبدیل شد:");
    console.log(`📱 شماره تماس: ${user.phone}`);
    console.log(`👤 نام: ${user.name || "ندارد"}`);
    console.log(`👑 نقش: ${user.role}`);
  } catch (error) {
    console.error("❌ خطا در تبدیل کاربر به ادمین:", error);
    console.log("\n💡 راهنما:");
    console.log("1. ابتدا با این شماره وارد سیستم شوید");
    console.log("2. سپس این اسکریپت را اجرا کنید");
  }
}

// دریافت شماره تلفن از آرگومان خط فرمان
const phone = process.argv[2];

if (!phone) {
  console.log("❌ لطفاً شماره تلفن را وارد کنید:");
  console.log("npx tsx scripts/make-admin.ts 09123456789");
  process.exit(1);
}

makeAdmin(phone).finally(() => db.$disconnect());
