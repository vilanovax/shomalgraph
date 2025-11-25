"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LocationPicker } from "@/components/travel/LocationPicker";
import { Loader2, Clock } from "lucide-react";

interface QuickPlanFormProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export function QuickPlanForm({ initialLocation }: QuickPlanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(initialLocation);

  const [formData, setFormData] = useState({
    travelType: "",
    availableTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("لطفاً موقعیت خود را مشخص کنید");
      return;
    }

    if (!formData.travelType || !formData.availableTime) {
      setError("لطفاً تمام فیلدها را پر کنید");
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
          planType: "QUICK",
          location,
          travelType: formData.travelType,
          availableTime: formData.availableTime,
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
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <CardTitle>برنامه فوری</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* موقعیت */}
          <div className="space-y-2">
            <Label>موقعیت فعلی</Label>
            <LocationPicker
              value={location}
              onChange={setLocation}
              onError={setError}
            />
          </div>

          {/* نوع سفر */}
          <div className="space-y-3">
            <Label>با کی هستی؟</Label>
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
                <RadioGroupItem value="FRIENDS" id="friends" />
                <Label htmlFor="friends" className="flex-1 cursor-pointer">
                  دوستان
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* زمان موجود */}
          <div className="space-y-3">
            <Label>چقدر وقت داری؟</Label>
            <RadioGroup
              value={formData.availableTime}
              onValueChange={(value) =>
                setFormData({ ...formData, availableTime: value })
              }
            >
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="ONE_TO_TWO_HOURS" id="1-2h" />
                <Label htmlFor="1-2h" className="flex-1 cursor-pointer">
                  ۱-۲ ساعت
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="HALF_DAY" id="half-day" />
                <Label htmlFor="half-day" className="flex-1 cursor-pointer">
                  نیم روز
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="FULL_DAY" id="full-day" />
                <Label htmlFor="full-day" className="flex-1 cursor-pointer">
                  کل روز
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2 bg-gradient-to-l from-yellow-500 to-orange-500 text-white"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            ایجاد برنامه فوری
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

