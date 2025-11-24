"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  restaurantId?: string;
  placeId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BookmarkButton({
  restaurantId,
  placeId,
  className,
  size = "md",
}: BookmarkButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // بررسی وضعیت favorite
  useEffect(() => {
    async function checkFavorite() {
      try {
        setIsChecking(true);
        const params = new URLSearchParams();
        if (restaurantId) params.append("restaurantId", restaurantId);
        if (placeId) params.append("placeId", placeId);

        const response = await fetch(`/api/favorites?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkFavorite();
  }, [restaurantId, placeId]);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          placeId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorite(data.isFavorite);
      } else {
        alert(data.error || "خطا در به‌روزرسانی بوک‌مارک");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("خطا در به‌روزرسانی بوک‌مارک");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("gap-2", className)}
      >
        <Heart className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all",
        isFavorite
          ? "bg-pink-500 hover:bg-pink-600 text-white"
          : "hover:bg-pink-50 hover:border-pink-300",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isFavorite && "fill-current"
        )}
      />
      {isFavorite ? "ذخیره شده" : "ذخیره"}
    </Button>
  );
}

