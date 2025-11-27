"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load CommentsSection برای بهبود performance
const CommentsSection = dynamic(
  () => import("./CommentsSection").then((mod) => ({ default: mod.CommentsSection })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="mr-2 text-sm text-muted-foreground">در حال بارگذاری کامنت‌ها...</span>
      </div>
    ),
    ssr: false, // کامنت‌ها client-side هستند
  }
);

interface CommentsSectionWrapperProps {
  itemType: "RESTAURANT" | "PLACE" | "CHECKLIST";
  restaurantId?: string;
  placeId?: string;
  checklistId?: string;
}

export function CommentsSectionWrapper(props: CommentsSectionWrapperProps) {
  return <CommentsSection {...props} />;
}

