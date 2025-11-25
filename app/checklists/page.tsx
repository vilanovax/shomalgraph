import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChecklistCard } from "@/components/checklist/ChecklistCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { ChecklistListClient } from "@/components/checklist/ChecklistListClient";

export default async function ChecklistsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const checklists = await db.travelChecklist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // محاسبه درصد پیشرفت
    const checklistsWithProgress = await Promise.all(
      checklists.map(async (checklist) => {
        const allItems = await db.checklistItem.findMany({
          where: { checklistId: checklist.id },
          select: { isChecked: true },
        });

        const checkedCount = allItems.filter((item) => item.isChecked).length;
        const totalCount = allItems.length;
        const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

        return {
          ...checklist,
          progress: Math.round(progress),
          checkedCount,
          totalCount,
        };
      })
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">چک‌لیست‌های سفر</h1>
            <p className="text-muted-foreground">
              چک‌لیست‌های خود را مدیریت کنید
            </p>
          </div>
          <Link href="/checklists/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              چک‌لیست جدید
            </Button>
          </Link>
        </div>

        {/* Checklists List */}
        <ChecklistListClient checklists={checklistsWithProgress} />
      </div>
    </div>
  );
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">خطا در بارگذاری چک‌لیست‌ها</h1>
            <p className="text-muted-foreground">
              لطفاً صفحه را refresh کنید یا دوباره تلاش کنید.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

