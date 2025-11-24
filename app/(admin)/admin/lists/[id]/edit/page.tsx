"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { KeywordsInput } from "@/components/ui/keywords-input";
import {
  ArrowRight,
  Loader2,
  List,
} from "lucide-react";

export default function EditListPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    coverImage: "",
    keywords: [] as string[],
  });

  // دریافت اطلاعات لیست
  useEffect(() => {
    async function fetchList() {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/admin/lists/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "خطا در دریافت اطلاعات لیست");
        }

        const list = data.data;
        setFormData({
          title: list.title || "",
          description: list.description || "",
          slug: list.slug || "",
          coverImage: list.coverImage || "",
          keywords: list.keywords || [],
        });
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "خطای ناشناخته"
        );
      } finally {
        setIsFetching(false);
      }
    }

    if (id) {
      fetchList();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/lists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ویرایش لیست");
      }

      router.push(`/admin/lists/${id}`);
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطای ناشناخته"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormReady = Boolean(formData.title.trim());

  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            در حال بارگذاری اطلاعات لیست...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-l from-purple-600 via-pink-600 to-rose-500 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">پنل مدیریت · ویرایش لیست</p>
            <h1 className="mt-1 text-3xl font-black">ویرایش لیست</h1>
            <p className="text-white/80">
              اطلاعات لیست را به‌روزرسانی کنید و تغییرات را ذخیره کنید.
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="gap-2 bg-white/20 text-white hover:bg-white/30"
          >
            <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
            بازگشت
          </Button>
        </div>
        <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              وضعیت آماده‌سازی
            </p>
            <p className="mt-2 text-lg font-semibold">
              {isFormReady ? "آماده ذخیره" : "نیاز به عنوان"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              نوع لیست
            </p>
            <p className="mt-2 text-lg font-semibold">عمومی</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">اطلاعات لیست</CardTitle>
          <CardDescription>
            عنوان و توضیحات لیست را ویرایش کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                عنوان لیست <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="بهترین تفریحات با خانواده در چالوس"
                className="text-lg font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="بهترین-تفریحات-چالوس"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="توضیحات کوتاه درباره این لیست..."
                rows={4}
              />
            </div>

            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => handleChange("coverImage", url)}
              label="تصویر کاور (اختیاری)"
              placeholder="https://example.com/image.jpg"
            />

            <KeywordsInput
              value={formData.keywords}
              onChange={(keywords) => setFormData((prev) => ({ ...prev, keywords }))}
              label="کلمات کلیدی / هشتگ‌ها (اختیاری)"
              placeholder="مثال: چالوس، تفریحات، خانواده"
            />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading || !isFormReady}
                className="flex-1 gap-2 bg-gradient-to-l from-purple-600 to-pink-500 text-white shadow-lg hover:opacity-90"
              >
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                ذخیره تغییرات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

