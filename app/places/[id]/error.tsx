"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error("Place detail error:", error);
  }, [error]);

  const isDatabaseError = 
    error.message?.includes("Can't reach database") ||
    error.message?.includes("database server") ||
    error.message?.includes("PrismaClientKnownRequestError");

  return (
    <div className="min-h-screen bg-muted/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">
              {isDatabaseError ? "مشکل اتصال به دیتابیس" : "خطا در بارگذاری"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-muted-foreground">
            {isDatabaseError
              ? "در حال حاضر امکان اتصال به سرور دیتابیس وجود ندارد. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید."
              : "متأسفانه خطایی در بارگذاری اطلاعات رخ داد. لطفاً دوباره تلاش کنید."}
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تلاش مجدد
            </Button>
            <Link href="/places">
              <Button
                variant="outline"
                className="flex-1"
              >
                <Home className="ml-2 h-4 w-4" />
                بازگشت
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

