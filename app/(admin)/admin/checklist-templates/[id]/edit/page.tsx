import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TemplateForm } from "@/components/checklist/TemplateForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TemplateEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateEditPage({
  params,
}: TemplateEditPageProps) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const template = await db.travelChecklistTemplate.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">قالب یافت نشد</h1>
          <Link href="/admin/checklist-templates">
            <Button>بازگشت</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/checklist-templates">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>
        </div>
        <TemplateForm template={template} />
      </div>
    </div>
  );
}

