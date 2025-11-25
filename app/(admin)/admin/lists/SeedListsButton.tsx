"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { seedLists } from "./seed-action";

export function SeedListsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await seedLists();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "لیست‌های نمونه با موفقیت ایجاد شدند",
        });
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "خطا در ایجاد لیست‌های نمونه",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "خطا در ایجاد لیست‌های نمونه",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSeed}
        disabled={isLoading}
        className="gap-2"
        variant="outline"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        ایجاد 5 لیست نمونه
      </Button>
      {message && (
        <p
          className={`text-sm ${
            message.type === "success"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

