"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SuggestItemButtonProps {
  listId?: string;
  restaurants?: Array<{ id: string; name: string }>;
  places?: Array<{ id: string; name: string }>;
}

export function SuggestItemButton({
  listId,
  restaurants = [],
  places = []
}: SuggestItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemType, setItemType] = useState<"restaurant" | "place">("restaurant");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedItemId) {
      alert("لطفاً یک آیتم انتخاب کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/explore/items/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId,
          restaurantId: itemType === "restaurant" ? selectedItemId : undefined,
          placeId: itemType === "place" ? selectedItemId : undefined,
          note,
        }),
      });

      if (res.ok) {
        alert("پیشنهاد شما با موفقیت ثبت شد و در انتظار تایید ادمین است");
        setIsOpen(false);
        setSelectedItemId("");
        setNote("");
      } else {
        const error = await res.json();
        alert(error.error || "خطا در ثبت پیشنهاد");
      }
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const items = itemType === "restaurant" ? restaurants : places;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50">
          <Plus className="h-4 w-4" />
          پیشنهاد آیتم جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>پیشنهاد آیتم جدید</DialogTitle>
          <DialogDescription>
            یک رستوران یا مکان گردشگری برای افزودن به این لیست پیشنهاد دهید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>نوع</Label>
            <Select
              value={itemType}
              onValueChange={(value: "restaurant" | "place") => {
                setItemType(value);
                setSelectedItemId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">رستوران</SelectItem>
                <SelectItem value="place">مکان گردشگری</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>انتخاب {itemType === "restaurant" ? "رستوران" : "مکان"}</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید..." />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>توضیحات (اختیاری)</Label>
            <Textarea
              placeholder="دلیل پیشنهاد این آیتم را بنویسید..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedItemId}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                در حال ارسال...
              </>
            ) : (
              "ارسال پیشنهاد"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
