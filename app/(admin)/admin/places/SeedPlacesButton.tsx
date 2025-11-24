"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { seedPlaces } from "./seed-action";

export function SeedPlacesButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const result = await seedPlaces();

      if (result.success) {
        setStatus("success");
        setMessage(result.message || `${result.count} مکان اضافه شد`);
        setTimeout(() => {
          setStatus(null);
          setMessage("");
          router.refresh();
        }, 3000);
      } else {
        setStatus("error");
        setMessage(result.error || "خطا در افزودن مکان‌ها");
        console.error("Error response:", result);
        setTimeout(() => {
          setStatus(null);
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error seeding places:", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید."
      );
      setTimeout(() => {
        setStatus(null);
        setMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleSeed}
        disabled={loading}
        size="lg"
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
      >
        {loading ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            در حال افزودن...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="ml-2 h-5 w-5" />
            اضافه شد
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="ml-2 h-5 w-5" />
            خطا
          </>
        ) : (
          <>
            <Database className="ml-2 h-5 w-5" />
            افزودن 10 نمونه
          </>
        )}
      </Button>

      {/* Status Message */}
      {message && (
        <Card
          className={`absolute top-full mt-2 left-0 z-50 min-w-[300px] ${
            status === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {status === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <p
                className={`text-sm ${
                  status === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

