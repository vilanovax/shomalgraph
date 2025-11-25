"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info } from "lucide-react";

export function TripPlanForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>برنامه سفر چندروزه</CardTitle>
        <CardDescription>
          این قابلیت به زودی اضافه خواهد شد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            برنامه‌ریزی سفر چندروزه در حال توسعه است و به زودی در دسترس قرار خواهد گرفت.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

