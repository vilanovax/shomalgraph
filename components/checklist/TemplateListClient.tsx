"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2, ClipboardList } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TemplateListClientProps {
  templates: Array<{
    id: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    travelType: string | null;
    season?: string | null;
    isActive: boolean;
    createdAt: Date;
    createdBy: {
      id: string;
      name?: string | null;
    };
    _count: {
      items: number;
    };
  }>;
}

const travelTypeLabels: Record<string, string> = {
  FAMILY_WITH_KIDS: "خانواده با بچه",
  NATURE: "طبیعت",
  BEACH: "ساحل",
  URBAN: "شهری",
  COUPLE: "زوج",
  FRIENDS: "دوستان",
  SOLO: "تنها",
  OTHER: "سایر",
};

export function TemplateListClient({ templates: initialTemplates }: TemplateListClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/checklist-templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف قالب");
      }

      setTemplates(templates.filter((t) => t.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("خطا در حذف قالب");
    }
  };


  if (templates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-muted rounded-full mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            هنوز قالبی ایجاد نشده است
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            اولین قالب چک‌لیست را ایجاد کنید
          </p>
          <Link href="/admin/checklist-templates/new">
            <Button>ایجاد قالب جدید</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {template.icon && (
                    <span className="text-2xl">{template.icon}</span>
                  )}
                  <h3 className="text-lg font-semibold">{template.title}</h3>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {travelTypeLabels[template.travelType] || template.travelType}
                </Badge>
                {template.isActive ? (
                  <Badge variant="default" className="text-xs">
                    فعال
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    غیرفعال
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  {template._count.items} آیتم
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/admin/checklist-templates/${template.id}/edit`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit className="h-4 w-4 ml-2" />
                    ویرایش
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف قالب</AlertDialogTitle>
                      <AlertDialogDescription>
                        آیا مطمئن هستید که می‌خواهید این قالب را حذف کنید؟
                        این عمل قابل بازگشت نیست.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(template.id)}
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

