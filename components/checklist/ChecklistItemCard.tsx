"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ChecklistItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    isRequired: boolean;
    isChecked: boolean;
    order: number;
  };
  onToggle: (itemId: string, isChecked: boolean) => void;
  readOnly?: boolean;
  minimal?: boolean; // حالت نمایشی ساده
}

export function ChecklistItemCard({
  item,
  onToggle,
  readOnly = false,
  minimal = false,
}: ChecklistItemCardProps) {
  if (minimal) {
    // حالت نمایشی ساده - فقط checkbox و نام
    return (
      <div className="flex items-center gap-2 py-2 border-b last:border-b-0 w-full overflow-x-hidden">
        {!readOnly && (
          <Checkbox
            checked={item.isChecked}
            onCheckedChange={(checked) =>
              onToggle(item.id, checked === true)
            }
            className="shrink-0"
          />
        )}
        {readOnly && (
          <div className="shrink-0">
            {item.isChecked ? (
              <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
            )}
          </div>
        )}
        <span
          className={`flex-1 text-sm min-w-0 break-words ${
            item.isChecked ? "line-through text-muted-foreground" : ""
          }`}
        >
          {item.name}
        </span>
      </div>
    );
  }

  // حالت نمایشی کامل
  return (
    <Card
      className={`border-l-4 w-full overflow-x-hidden ${
        item.isChecked
          ? "border-l-green-500 bg-green-50/50"
          : "border-l-gray-300"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 w-full overflow-x-hidden">
          {!readOnly && (
            <Checkbox
              checked={item.isChecked}
              onCheckedChange={(checked) =>
                onToggle(item.id, checked === true)
              }
              className="mt-1 shrink-0"
            />
          )}
          {readOnly && (
            <div className="mt-1 shrink-0">
              {item.isChecked ? (
                <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 overflow-x-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium break-words ${
                    item.isChecked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {item.description}
                  </p>
                )}
              </div>
              {item.isRequired && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  ضروری
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

