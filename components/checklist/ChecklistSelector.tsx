"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ClipboardList, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Template {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  _count: {
    items: number;
  };
}

export function ChecklistSelector() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

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
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplateId) {
      alert("لطفاً یک قالب انتخاب کنید");
      return;
    }

    if (!customTitle.trim()) {
      alert("عنوان چک‌لیست الزامی است");
      return;
    }

    try {
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: customTitle,
          description: customDescription || undefined,
          templateId: selectedTemplateId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ایجاد چک‌لیست");
      }

      router.push(`/checklists/${data.data.id}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating checklist:", error);
      alert("خطا در ایجاد چک‌لیست");
    }
  };

  const handleCreateEmpty = () => {
    router.push("/checklists/new");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-purple-300 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle>چک‌لیست‌های سفر</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          چک‌لیست‌های آماده را انتخاب کنید یا یک چک‌لیست جدید ایجاد کنید
        </p>

        {/* قالب‌های آماده */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">قالب‌های آماده:</h4>
            <div className="grid gap-2">
              {templates.slice(0, 3).map((template) => (
                <Dialog
                  key={template.id}
                  open={isDialogOpen && selectedTemplateId === template.id}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) {
                      setSelectedTemplateId(template.id);
                      setSelectedTemplate(template);
                      // استفاده از عنوان template به عنوان پیش‌فرض
                      setCustomTitle(template.title);
                      setCustomDescription(template.description || "");
                    } else {
                      setSelectedTemplateId("");
                      setSelectedTemplate(null);
                      setCustomTitle("");
                      setCustomDescription("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                    >
                      <div className="flex items-start gap-3 w-full">
                        {template.icon && (
                          <span className="text-2xl">{template.icon}</span>
                        )}
                        <div className="flex-1 text-right">
                          <div className="font-semibold">{template.title}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {template._count.items} آیتم
                          </div>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ایجاد چک‌لیست از قالب</DialogTitle>
                      <DialogDescription>
                        نام چک‌لیست خود را تعیین کنید
                      </DialogDescription>
                    </DialogHeader>
                      <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>عنوان چک‌لیست *</Label>
                        <Input
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder={selectedTemplate?.title || "مثلاً: سفر به رامسر"}
                        />
                        {selectedTemplate && (
                          <p className="text-xs text-muted-foreground">
                            عنوان از قالب استفاده شده است. می‌توانید آن را تغییر دهید.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>توضیحات (اختیاری)</Label>
                        <Textarea
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="توضیحات مختصری..."
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setSelectedTemplateId("");
                            setCustomTitle("");
                            setCustomDescription("");
                          }}
                        >
                          انصراف
                        </Button>
                        <Button onClick={handleCreateFromTemplate}>
                          ایجاد چک‌لیست
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}

        {/* دکمه ایجاد از صفر */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleCreateEmpty}
        >
          <Plus className="h-4 w-4" />
          ایجاد چک‌لیست جدید از صفر
        </Button>

        {/* لینک به صفحه لیست چک‌لیست‌ها */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/checklists")}
        >
          مشاهده همه چک‌لیست‌های من
        </Button>
      </CardContent>
    </Card>
  );
}

