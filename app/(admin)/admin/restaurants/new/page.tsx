"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  Phone,
  Navigation2,
} from "lucide-react";

const initialFormState = {
  name: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  priceRange: "MODERATE",
};

const FORM_STEPS = [
  {
    title: "اطلاعات پایه",
    helper: "نام، توضیحات و حس برند",
    icon: Sparkles,
  },
  {
    title: "موقعیت مکانی",
    helper: "مختصات دقیق و آدرس کامل",
    icon: MapPin,
  },
  {
    title: "راه‌های ارتباطی",
    helper: "شماره تماس و قیمت‌گذاری",
    icon: Phone,
  },
] as const;

const PRICE_RANGE_OPTIONS = [
  { value: "BUDGET", label: "ارزان" },
  { value: "MODERATE", label: "متوسط" },
  { value: "EXPENSIVE", label: "گران" },
  { value: "LUXURY", label: "لاکچری" },
] as const;

type FormFields = typeof initialFormState;

export default function NewRestaurantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormFields>(initialFormState);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priceRangeLabel = PRICE_RANGE_OPTIONS.find(
    (option) => option.value === formData.priceRange
  )?.label;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در افزودن رستوران");
      }

      router.push("/admin/restaurants");
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطای ناشناخته"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickPreset = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: "36.5659",
      longitude: "51.5282",
      address: prev.address || "مازندران، بابلسر، بلوار ساحلی",
    }));
  };

  // محاسبه وضعیت آماده بودن فرم برای ارسال جهت نمایش بازخورد لحظه‌ای
  const isFormReady =
    Boolean(formData.name.trim()) &&
    Boolean(formData.address.trim()) &&
    Boolean(formData.latitude && formData.longitude);

  // برای نمایش وضعیت مرحله‌ای فرم، تکمیل هر بخش را بررسی می‌کنیم
  const stepCompletion = [
    Boolean(formData.name.trim()),
    Boolean(
      formData.address.trim() && formData.latitude && formData.longitude
    ),
    Boolean(formData.phone.trim() || formData.priceRange),
  ];
  const completedSteps = stepCompletion.filter(Boolean).length;
  const progressValue = Math.round((completedSteps / FORM_STEPS.length) * 100);

  const previewName = formData.name || "نام رستوران";
  const previewAddress = formData.address || "آدرس کامل رستوران...";
  const previewPhone = formData.phone || "011-xxxxxxx";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-l from-emerald-600 via-green-600 to-lime-500 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">پنل مدیریت · افزودن سریع</p>
            <h1 className="mt-1 text-3xl font-black">افزودن رستوران جدید</h1>
            <p className="text-white/80">
              اطلاعات دقیق‌تر وارد کنید تا لیست‌های اکسپلور جذاب‌تر شوند.
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
        <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              وضعیت آماده‌سازی
            </p>
            <p className="mt-2 text-lg font-semibold">
              {isFormReady ? "آماده ارسال" : "نیاز به اطلاعات تکمیلی"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              محدوده قیمت انتخابی
            </p>
            <p className="mt-2 text-lg font-semibold">{priceRangeLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              پیشروی فرم
            </p>
            <p className="mt-2 text-lg font-semibold">%{progressValue}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">جزئیات برند و اطلاعات مکان</CardTitle>
            <CardDescription>
              فرم را کامل کنید تا رستوران در کمتر از یک دقیقه منتشر شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            <div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                مسیر تکمیل فرم
              </p>
              <div className="flex flex-wrap gap-3">
                {FORM_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isDone = stepCompletion[index];
                  const isActive = index === completedSteps;
                  return (
                    <div
                      key={step.title}
                      className={cn(
                        "flex min-w-[180px] flex-1 items-start gap-3 rounded-2xl border bg-white p-3 shadow-sm transition",
                        isDone && "border-green-500/60 ring-1 ring-green-200",
                        !isDone && !isActive && "opacity-60"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border bg-muted text-muted-foreground",
                          isDone && "border-green-500 bg-green-50 text-green-600"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.helper}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <section className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">اطلاعات برند</p>
                    <p className="text-sm text-muted-foreground">
                      هویت و داستان کوتاه رستوران را تعریف کنید.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    مرحله ۱
                  </Badge>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      نام رستوران <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="رستوران شمال"
                      className="text-lg font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      placeholder="توضیحات کوتاه درباره رستوران..."
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">موقعیت مکانی</p>
                    <p className="text-sm text-muted-foreground">
                      آدرس دقیق و مختصات جغرافیایی را وارد کنید.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleQuickPreset}
                    >
                      <Navigation2 className="h-4 w-4" />
                      پر کردن سریع
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      مرحله ۲
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    آدرس <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="آدرس کامل رستوران..."
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                    <Label htmlFor="latitude">
                      عرض جغرافیایی <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleChange("latitude", e.target.value)}
                      placeholder="36.5659"
                      required
                    />
                  </div>
                  <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                    <Label htmlFor="longitude">
                      طول جغرافیایی <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        handleChange("longitude", e.target.value)
                      }
                      placeholder="51.5282"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">راه‌های ارتباطی</p>
                    <p className="text-sm text-muted-foreground">
                      مشخص کنید مشتریان چگونه با شما ارتباط بگیرند.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    مرحله ۳
                  </Badge>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="011-12345678"
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceRange">محدوده قیمت</Label>
                    <Select
                      value={formData.priceRange}
                      onValueChange={(value) => handleChange("priceRange", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_RANGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        تنظیمات پیشرفته فرم
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ابزارهایی برای سرعت‌بخشیدن به ورود اطلاعات.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced((prev) => !prev)}
                    >
                      {showAdvanced ? "بستن" : "نمایش"}
                    </Button>
                  </div>
                  {showAdvanced && (
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>
                        • در صورت تکراری بودن آدرس، از الگوی پیشنهادی بالا استفاده
                        کنید.
                      </p>
                      <p>
                        • برای شماره تماس سازمانی، حتماً پیش‌شماره شهر را درج کنید.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2 bg-gradient-to-l from-green-600 to-emerald-500 text-white shadow-lg hover:opacity-90"
                >
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  ثبت و انتشار رستوران
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

        <div className="space-y-5">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">پیش‌نمایش کارت در لیست</CardTitle>
              <CardDescription>
                ظاهر رستوران در بخش اکسپلور به‌صورت زنده به‌روزرسانی می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-700">
                      {previewName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {previewAddress}
                    </p>
                  </div>
                  <Badge variant="outline">{priceRangeLabel}</Badge>
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{previewPhone}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>
                  {isFormReady
                    ? "تمام اطلاعات حیاتی تکمیل شده و می‌توانید رستوران را منتشر کنید."
                    : "برای انتشار سریع، موارد اجباری را کامل کنید."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
