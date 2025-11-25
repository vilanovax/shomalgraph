"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ClipboardList, Sparkles } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  _count: {
    items: number;
  };
}

export function ChecklistNewForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    templateId: "",
    startFrom: "template", // "template" | "empty"
  });

  // دریافت قالب‌ها
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/checklists/templates");
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title) {
      setError("عنوان الزامی است");
      return;
    }

    if (formData.startFrom === "template" && !formData.templateId) {
      setError("لطفاً یک قالب انتخاب کنید");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          templateId:
            formData.startFrom === "template" ? formData.templateId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ایجاد چک‌لیست");
      }

      router.push(`/checklists/${data.data.id}`);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در ایجاد چک‌لیست"
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
          <CardTitle>ایجاد چک‌لیست جدید</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* شروع از قالب یا خالی */}
          <div className="space-y-3">
            <Label>از کجا شروع کنیم؟</Label>
            <RadioGroup
              value={formData.startFrom}
              onValueChange={(value) =>
                setFormData({ ...formData, startFrom: value })
              }
            >
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="template" id="template" />
                <Label htmlFor="template" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>استفاده از قالب آماده</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="empty" id="empty" />
                <Label htmlFor="empty" className="flex-1 cursor-pointer">
                  شروع از صفر
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* انتخاب قالب */}
          {formData.startFrom === "template" && (
            <div className="space-y-2">
              <Label>انتخاب قالب</Label>
              {isLoadingTemplates ? (
                <div className="text-sm text-muted-foreground">
                  در حال بارگذاری قالب‌ها...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                  هیچ قالب فعالی وجود ندارد
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.templateId === template.id
                          ? "border-purple-500 bg-purple-50"
                          : "hover:bg-muted"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, templateId: template.id })
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {template.icon ? (
                            <span className="text-2xl">{template.icon}</span>
                          ) : (
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.title}</h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {template._count.items} آیتم
                          </p>
                        </div>
                        {formData.templateId === template.id && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* عنوان */}
          <div className="space-y-2">
            <Label>عنوان چک‌لیست *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="مثلاً: سفر به رامسر"
              required
            />
          </div>

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات (اختیاری)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="توضیحات مختصری درباره این چک‌لیست..."
              rows={3}
            />
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
            ایجاد چک‌لیست
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
