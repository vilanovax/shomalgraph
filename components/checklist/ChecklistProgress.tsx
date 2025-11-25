"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ChecklistProgressProps {
  checkedCount: number;
  totalCount: number;
  className?: string;
}

export function ChecklistProgress({
  checkedCount,
  totalCount,
  className,
}: ChecklistProgressProps) {
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {checkedCount} از {totalCount}
          </span>
        </div>
        <span className="text-sm font-bold text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

