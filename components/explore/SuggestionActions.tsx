"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2 } from "lucide-react";

interface SuggestionActionsProps {
  suggestionId: string;
}

export function SuggestionActions({ suggestionId }: SuggestionActionsProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/explore/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId,
          action,
          adminNote: adminNote || undefined,
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "خطا در انجام عملیات");
      }
    } catch (error) {
      console.error("Error processing suggestion:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t">
      <Textarea
        placeholder="پاسخ یا توضیحات ادمین (اختیاری)..."
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("approve")}
          disabled={isProcessing}
          className="flex-1 gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          تایید
        </Button>
        <Button
          onClick={() => handleAction("reject")}
          disabled={isProcessing}
          variant="destructive"
          className="flex-1 gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          رد
        </Button>
      </div>
    </div>
  );
}
