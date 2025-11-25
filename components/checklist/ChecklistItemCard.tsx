"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, FileText } from "lucide-react";
import { useState } from "react";

interface ChecklistItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    isRequired: boolean;
    isChecked: boolean;
    notes?: string | null;
    order: number;
  };
  onToggle: (itemId: string, isChecked: boolean) => void;
  onEditNotes?: (itemId: string, notes: string) => void;
  readOnly?: boolean;
}

export function ChecklistItemCard({
  item,
  onToggle,
  onEditNotes,
  readOnly = false,
}: ChecklistItemCardProps) {
  const [notes, setNotes] = useState(item.notes || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveNotes = () => {
    if (onEditNotes) {
      onEditNotes(item.id, notes);
    }
    setIsDialogOpen(false);
  };

  return (
    <Card
      className={`border-l-4 ${
        item.isChecked
          ? "border-l-green-500 bg-green-50/50"
          : "border-l-gray-300"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {!readOnly && (
            <Checkbox
              checked={item.isChecked}
              onCheckedChange={(checked) =>
                onToggle(item.id, checked === true)
              }
              className="mt-1"
            />
          )}
          {readOnly && (
            <div className="mt-1">
              {item.isChecked ? (
                <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    item.isChecked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              {item.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  ضروری
                </Badge>
              )}
            </div>

            {item.notes && (
              <div className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{item.notes}</span>
              </div>
            )}

            {!readOnly && onEditNotes && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Edit2 className="h-3 w-3" />
                    {item.notes ? "ویرایش یادداشت" : "افزودن یادداشت"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>یادداشت برای {item.name}</DialogTitle>
                    <DialogDescription>
                      یادداشت شخصی خود را برای این آیتم بنویسید
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="یادداشت خود را بنویسید..."
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        انصراف
                      </Button>
                      <Button onClick={handleSaveNotes}>ذخیره</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

