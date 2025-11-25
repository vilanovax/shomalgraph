import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Trash2, ClipboardList } from "lucide-react";
import { TemplateListClient } from "@/components/checklist/TemplateListClient";

export default async function ChecklistTemplatesPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const templates = await db.travelChecklistTemplate.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">قالب‌های چک‌لیست</h1>
            <p className="text-muted-foreground">
              مدیریت قالب‌های پایه برای چک‌لیست‌های سفر
            </p>
          </div>
          <Link href="/admin/checklist-templates/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              قالب جدید
            </Button>
          </Link>
        </div>

        {/* Templates List */}
        <TemplateListClient templates={templates} />
      </div>
    </div>
  );
}

