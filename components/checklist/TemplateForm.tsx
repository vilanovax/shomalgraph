"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ClipboardList, Plus, Trash2 } from "lucide-react";

interface TemplateFormProps {
  template?: {
    id: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    travelType?: string | null;
    season?: string | null;
    isActive: boolean;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      isRequired: boolean;
      order: number;
    }>;
  };
}

export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: template?.title || "",
    description: template?.description || "",
    icon: template?.icon || "",
    travelType: template?.travelType || "",
    season: template?.season || "ALL",
    isActive: template?.isActive ?? true,
  });

  const [items, setItems] = useState(
    template?.items || []
  );

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        name: "",
        description: "",
        isRequired: false,
        order: items.length,
      },
    ]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: string | boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title) {
      setError("عنوان الزامی است");
      return;
    }

    if (items.length === 0) {
      setError("حداقل یک آیتم باید اضافه شود");
      return;
    }

    for (const item of items) {
      if (!item.name.trim()) {
        setError("نام تمام آیتم‌ها باید پر شود");
        return;
      }
    }

    setIsLoading(true);

    try {
      const url = template
        ? `/api/admin/checklist-templates/${template.id}`
        : "/api/admin/checklist-templates";
      const method = template ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: items.map((item, index) => ({
            name: item.name,
            description: item.description || undefined,
            order: index,
            isRequired: item.isRequired,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ذخیره قالب");
      }

      router.push("/admin/checklist-templates");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در ذخیره قالب"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle>
            {template ? "ویرایش قالب" : "ایجاد قالب جدید"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات پایه */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="مثلاً: لیست سفر خانوادگی دریا"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>آیکون (emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="مثلاً: 🏖️"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="توضیحات مختصری درباره این چک‌لیست..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع سفر (اختیاری)</Label>
              <Select
                value={formData.travelType}
                onValueChange={(value) =>
                  setFormData({ ...formData, travelType: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">هیچکدام</SelectItem>
                  <SelectItem value="FAMILY_WITH_KIDS">خانواده با بچه</SelectItem>
                  <SelectItem value="NATURE">طبیعت</SelectItem>
                  <SelectItem value="BEACH">ساحل</SelectItem>
                  <SelectItem value="URBAN">شهری</SelectItem>
                  <SelectItem value="COUPLE">زوج</SelectItem>
                  <SelectItem value="FRIENDS">دوستان</SelectItem>
                  <SelectItem value="SOLO">تنها</SelectItem>
                  <SelectItem value="OTHER">سایر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>فصل</Label>
              <Select
                value={formData.season}
                onValueChange={(value) =>
                  setFormData({ ...formData, season: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPRING">بهار</SelectItem>
                  <SelectItem value="SUMMER">تابستان</SelectItem>
                  <SelectItem value="FALL">پاییز</SelectItem>
                  <SelectItem value="WINTER">زمستان</SelectItem>
                  <SelectItem value="ALL">همه فصول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* آیتم‌ها */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>آیتم‌های چک‌لیست *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                افزودن آیتم
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <p>هیچ آیتمی اضافه نشده است</p>
                <p className="text-sm mt-2">برای شروع، یک آیتم اضافه کنید</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {index + 1}.
                          </span>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateItem(index, "name", e.target.value)
                            }
                            placeholder="نام آیتم (مثلاً: مسواک)"
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="pr-10">
                          <Textarea
                            value={item.description || ""}
                            onChange={(e) =>
                              handleUpdateItem(index, "description", e.target.value)
                            }
                            placeholder="توضیحات اختیاری..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                        <div className="pr-10 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`required-${item.id}`}
                            checked={item.isRequired}
                            onChange={(e) =>
                              handleUpdateItem(index, "isRequired", e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`required-${item.id}`} className="text-sm cursor-pointer">
                            آیتم ضروری
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2 bg-gradient-to-l from-purple-500 to-pink-500 text-white"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {template ? "ذخیره تغییرات" : "ایجاد قالب"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
