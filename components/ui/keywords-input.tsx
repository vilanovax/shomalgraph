"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordsInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function KeywordsInput({
  value,
  onChange,
  label = "کلمات کلیدی / هشتگ‌ها",
  placeholder = "کلمه کلیدی را وارد کنید و Enter بزنید",
  className,
}: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const keyword = inputValue.trim();
      // حذف # از ابتدا اگر وجود دارد (خودمان اضافه می‌کنیم)
      const cleanKeyword = keyword.startsWith("#") ? keyword.slice(1) : keyword;
      
      if (cleanKeyword && !value.includes(cleanKeyword)) {
        onChange([...value, cleanKeyword]);
        setInputValue("");
      }
    }
  };

  const handleRemove = (keywordToRemove: string) => {
    onChange(value.filter((k) => k !== keywordToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="space-y-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          dir="ltr"
          className="text-left"
        />
        <p className="text-xs text-muted-foreground">
          کلمه کلیدی را وارد کنید و Enter بزنید. برای حذف روی badge کلیک کنید.
        </p>
        
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
            {value.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="gap-1.5 pr-2 pl-2 py-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleRemove(keyword)}
              >
                <Hash className="h-3 w-3" />
                {keyword}
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

