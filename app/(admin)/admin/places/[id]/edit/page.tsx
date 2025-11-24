"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Navigation2,
  Mountain,
} from "lucide-react";

const FORM_STEPS = [
  {
    title: "اطلاعات پایه",
    helper: "نام، توضیحات و نوع مکان",
    icon: Sparkles,
  },
  {
    title: "موقعیت مکانی",
    helper: "مختصات دقیق و آدرس کامل",
    icon: MapPin,
  },
  {
    title: "جزئیات و دسترسی",
    helper: "نوع دسترسی و مناسب برای",
    icon: Mountain,
  },
] as const;

const PLACE_TYPE_OPTIONS = [
  { value: "NATURE", label: "طبیعت" },
  { value: "HISTORICAL", label: "تاریخی" },
  { value: "ENTERTAINMENT", label: "تفریحی" },
  { value: "CULTURAL", label: "فرهنگی" },
  { value: "BEACH", label: "ساحل" },
  { value: "MOUNTAIN", label: "کوهستان" },
  { value: "FOREST", label: "جنگل" },
  { value: "WATERFALL", label: "آبشار" },
  { value: "PARK", label: "پارک" },
  { value: "OTHER", label: "سایر" },
] as const;

const SUITABLE_FOR_OPTIONS = [
  { value: "FAMILY", label: "خانواده" },
  { value: "COUPLE", label: "زوج" },
  { value: "FRIENDS", label: "دوستان" },
  { value: "SOLO", label: "انفرادی" },
  { value: "KIDS", label: "کودکان" },
] as const;

type FormFields = {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  placeType: string;
  suitableFor: string[];
  isFree: boolean;
  entryFee: string;
};

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormFields>({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    placeType: "OTHER",
    suitableFor: [],
    isFree: true,
    entryFee: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // دریافت اطلاعات مکان
  useEffect(() => {
    async function fetchPlace() {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/places/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "خطا در دریافت اطلاعات مکان");
        }

        const place = data.data;
        setFormData({
          name: place.name || "",
          description: place.description || "",
          address: place.address || "",
          latitude: place.latitude?.toString() || "",
          longitude: place.longitude?.toString() || "",
          placeType: place.placeType || "OTHER",
          suitableFor: place.suitableFor || [],
          isFree: place.isFree ?? true,
          entryFee: place.entryFee?.toString() || "",
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
      fetchPlace();
    }
  }, [id]);

  const placeTypeLabel = PLACE_TYPE_OPTIONS.find(
    (option) => option.value === formData.placeType
  )?.label;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/places/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          entryFee: formData.entryFee ? parseFloat(formData.entryFee) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ویرایش مکان");
      }

      router.push("/admin/places");
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطای ناشناخته"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormFields, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuitableForToggle = (value: string) => {
    setFormData((prev) => {
      const current = prev.suitableFor;
      if (current.includes(value)) {
        return { ...prev, suitableFor: current.filter((v) => v !== value) };
      } else {
        return { ...prev, suitableFor: [...current, value] };
      }
    });
  };

  const handleQuickPreset = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: prev.latitude || "36.5659",
      longitude: prev.longitude || "51.5282",
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
    Boolean(formData.name.trim() && formData.placeType),
    Boolean(
      formData.address.trim() && formData.latitude && formData.longitude
    ),
    Boolean(formData.suitableFor.length > 0 || formData.isFree !== undefined),
  ];
  const completedSteps = stepCompletion.filter(Boolean).length;
  const progressValue = Math.round((completedSteps / FORM_STEPS.length) * 100);

  const previewName = formData.name || "نام مکان";
  const previewAddress = formData.address || "آدرس کامل مکان...";

  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            در حال بارگذاری اطلاعات مکان...
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
            <p className="text-sm text-white/70">پنل مدیریت · ویرایش</p>
            <h1 className="mt-1 text-3xl font-black">ویرایش مکان گردشگری</h1>
            <p className="text-white/80">
              اطلاعات مکان را به‌روزرسانی کنید و تغییرات را ذخیره کنید.
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
              {isFormReady ? "آماده ذخیره" : "نیاز به اطلاعات تکمیلی"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-white/70">
              نوع مکان
            </p>
            <p className="mt-2 text-lg font-semibold">{placeTypeLabel}</p>
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
            <CardTitle className="text-xl">جزئیات مکان گردشگری</CardTitle>
            <CardDescription>
              اطلاعات را ویرایش کنید و تغییرات را ذخیره کنید.
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
                    <p className="text-lg font-semibold">اطلاعات پایه</p>
                    <p className="text-sm text-muted-foreground">
                      نام، توضیحات و نوع مکان را مشخص کنید.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    مرحله ۱
                  </Badge>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      نام مکان <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="جنگل ابر"
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
                      placeholder="توضیحات کوتاه درباره مکان..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeType">
                      نوع مکان <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.placeType}
                      onValueChange={(value) => handleChange("placeType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLACE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    placeholder="آدرس کامل مکان..."
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
                    <p className="text-lg font-semibold">جزئیات و دسترسی</p>
                    <p className="text-sm text-muted-foreground">
                      نوع دسترسی و مناسب برای چه کسانی است.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    مرحله ۳
                  </Badge>
                </div>
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label>مناسب برای</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SUITABLE_FOR_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2 space-x-reverse rounded-lg border p-3"
                        >
                          <Checkbox
                            id={option.value}
                            checked={formData.suitableFor.includes(
                              option.value
                            )}
                            onCheckedChange={() =>
                              handleSuitableForToggle(option.value)
                            }
                          />
                          <Label
                            htmlFor={option.value}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="isFree"
                        checked={formData.isFree}
                        onCheckedChange={(checked) =>
                          handleChange("isFree", checked === true)
                        }
                      />
                      <Label
                        htmlFor="isFree"
                        className="cursor-pointer text-sm font-medium"
                      >
                        رایگان است
                      </Label>
                    </div>
                    {!formData.isFree && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="entryFee">هزینه ورودی (تومان)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          value={formData.entryFee}
                          onChange={(e) =>
                            handleChange("entryFee", e.target.value)
                          }
                          placeholder="500000"
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                    )}
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
                        • برای مکان‌های رایگان، نیازی به وارد کردن هزینه ورودی نیست.
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
                  className="flex-1 gap-2 bg-gradient-to-l from-purple-600 to-pink-500 text-white shadow-lg hover:opacity-90"
                >
                  {isLoading && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
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

        <div className="space-y-5">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">پیش‌نمایش کارت در لیست</CardTitle>
              <CardDescription>
                ظاهر مکان در بخش اکسپلور به‌صورت زنده به‌روزرسانی می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-700">
                      {previewName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {previewAddress}
                    </p>
                  </div>
                  <Badge variant="outline">{placeTypeLabel}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.suitableFor.map((value) => {
                    const option = SUITABLE_FOR_OPTIONS.find(
                      (opt) => opt.value === value
                    );
                    return (
                      <Badge key={value} variant="secondary" className="text-xs">
                        {option?.label}
                      </Badge>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {formData.isFree ? (
                    <Badge variant="outline" className="text-green-600">
                      رایگان
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">
                      {formData.entryFee
                        ? `${parseInt(formData.entryFee).toLocaleString()} تومان`
                        : "هزینه ورودی"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>
                  {isFormReady
                    ? "تمام اطلاعات حیاتی تکمیل شده و می‌توانید تغییرات را ذخیره کنید."
                    : "برای ذخیره، موارد اجباری را کامل کنید."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

