"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Loader2,
  User,
  Save,
} from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
  });

  // دریافت اطلاعات پروفایل
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsFetching(true);
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "خطا در دریافت اطلاعات پروفایل");
        }

        const user = data.data;
        setFormData({
          name: user.name || "",
          avatar: user.avatar || "",
        });
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "خطای ناشناخته"
        );
      } finally {
        setIsFetching(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در به‌روزرسانی پروفایل");
      }

      console.log("Profile updated successfully:", data.data);

      setSuccess(true);
      // Refresh session to update user data
      await fetch("/api/auth/session?update", { method: "GET" });
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1000);
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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-muted/10">
        <MobileHeader title="ویرایش پروفایل" />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              در حال بارگذاری اطلاعات پروفایل...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <MobileHeader title="ویرایش پروفایل" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 p-6 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">ویرایش پروفایل</h1>
                <p className="text-white/80 text-sm mt-1">
                  اطلاعات شخصی خود را به‌روزرسانی کنید
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">اطلاعات شخصی</CardTitle>
            <CardDescription>
              نام و تصویر پروفایل خود را ویرایش کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  {formData.avatar && formData.avatar.trim() !== "" ? (
                    <AvatarImage src={formData.avatar} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {formData.name ? formData.name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground text-center">
                  پیش‌نمایش تصویر پروفایل
                </p>
              </div>

              {/* Avatar Upload */}
              <ImageUpload
                value={formData.avatar}
                onChange={(url) => handleChange("avatar", url)}
                label="تصویر پروفایل"
                placeholder="https://example.com/avatar.jpg"
              />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">نام</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className="text-lg"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  پروفایل با موفقیت به‌روزرسانی شد
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2 bg-gradient-to-l from-purple-600 to-pink-500 text-white shadow-lg hover:opacity-90"
                >
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
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
    </div>
  );
}

