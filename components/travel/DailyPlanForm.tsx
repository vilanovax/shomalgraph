"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Calendar, Clock, DollarSign } from "lucide-react";
import { LocationPicker } from "@/components/travel/LocationPicker";

interface DailyPlanFormProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const INTERESTS = [
  { id: "nature", label: "طبیعت‌گردی" },
  { id: "restaurant", label: "رستوران و کافه" },
  { id: "shopping", label: "خرید و فروشگاه‌گردی" },
  { id: "historical", label: "جاذبه تاریخی" },
  { id: "entertainment", label: "تفریحی و بازی" },
  { id: "beach", label: "ساحل و دریا" },
];

export function DailyPlanForm({ initialLocation }: DailyPlanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(initialLocation);

  const [formData, setFormData] = useState({
    searchRadius: "20",
    travelType: "",
    startTime: "10:00",
    endTime: "22:00",
    budget: "",
    interests: [] as string[],
  });

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestId],
      });
    } else {
      setFormData({
        ...formData,
        interests: formData.interests.filter((id) => id !== interestId),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("لطفاً موقعیت خود را مشخص کنید");
      return;
    }

    if (!formData.travelType) {
      setError("لطفاً نوع سفر را انتخاب کنید");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/travel/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: "DAILY",
          location,
          searchRadius: parseInt(formData.searchRadius),
          travelType: formData.travelType,
          startTime: formData.startTime,
          endTime: formData.endTime,
          budget: formData.budget || undefined,
          interests: formData.interests,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ایجاد برنامه");
      }

      router.push(`/explore/plan/${data.data.id}`);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در ایجاد برنامه"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle>برنامه روزانه</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* موقعیت */}
          <div className="space-y-2">
            <Label>کجا هستی؟</Label>
            <LocationPicker
              value={location}
              onChange={setLocation}
              onError={setError}
            />
          </div>

          {/* محدوده جستجو */}
          <div className="space-y-2">
            <Label>محدوده جستجو</Label>
            <Select
              value={formData.searchRadius}
              onValueChange={(value) =>
                setFormData({ ...formData, searchRadius: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">اطراف (تا ۵ کیلومتر)</SelectItem>
                <SelectItem value="20">نزدیک (تا ۲۰ کیلومتر)</SelectItem>
                <SelectItem value="50">دور هم باشه (تا ۵۰ کیلومتر)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* نوع سفر */}
          <div className="space-y-3">
            <Label>با کی سفر کردی؟</Label>
            <RadioGroup
              value={formData.travelType}
              onValueChange={(value) =>
                setFormData({ ...formData, travelType: value })
              }
            >
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="SOLO" id="solo" />
                <Label htmlFor="solo" className="flex-1 cursor-pointer">
                  تنها
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="COUPLE" id="couple" />
                <Label htmlFor="couple" className="flex-1 cursor-pointer">
                  با همسر/پارتنر
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="FAMILY_WITH_KIDS" id="family-kids" />
                <Label htmlFor="family-kids" className="flex-1 cursor-pointer">
                  خانواده با بچه
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="FAMILY_ADULTS" id="family-adults" />
                <Label htmlFor="family-adults" className="flex-1 cursor-pointer">
                  خانواده با بزرگسال
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="FRIENDS" id="friends" />
                <Label htmlFor="friends" className="flex-1 cursor-pointer">
                  گروه دوستان
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* بازه زمانی */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>از چه ساعتی</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>تا چه ساعتی</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* بودجه */}
          <div className="space-y-2">
            <Label>بودجه تقریبی</Label>
            <Select
              value={formData.budget}
              onValueChange={(value) =>
                setFormData({ ...formData, budget: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="مهم نیست" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMIC">اقتصادی</SelectItem>
                <SelectItem value="MODERATE">متوسط</SelectItem>
                <SelectItem value="LUXURY">لوکس</SelectItem>
                <SelectItem value="ANY">مهم نیست</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* علایق */}
          <div className="space-y-3">
            <Label>چه نوع فعالیت‌هایی دوست داری؟</Label>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted"
                >
                  <Checkbox
                    id={interest.id}
                    checked={formData.interests.includes(interest.id)}
                    onCheckedChange={(checked) =>
                      handleInterestChange(interest.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={interest.id}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {interest.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2 bg-gradient-to-l from-blue-500 to-indigo-500 text-white"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            ایجاد برنامه روزانه
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

