import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChecklistViewClient } from "@/components/checklist/ChecklistViewClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ChecklistPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const checklist = await db.travelChecklist.findUnique({
    where: { id },
    include: {
      template: {
        select: {
          id: true,
          title: true,
          icon: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!checklist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">چک‌لیست یافت نشد</h1>
          <Link href="/checklists">
            <Button>بازگشت به لیست</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (checklist.userId !== session.user.id && !checklist.isShared) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">دسترسی غیرمجاز</h1>
          <Link href="/checklists">
            <Button>بازگشت به لیست</Button>
          </Link>
        </div>
      </div>
    );
  }

  // محاسبه درصد پیشرفت
  const allItems = await db.checklistItem.findMany({
    where: { checklistId: checklist.id },
    select: { isChecked: true },
  });

  const checkedCount = allItems.filter((item) => item.isChecked).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/checklists">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>
        </div>

        <ChecklistViewClient
          checklist={{
            ...checklist,
            progress: Math.round(progress),
            checkedCount,
            totalCount,
          }}
        />
      </div>
    </div>
  );
}

