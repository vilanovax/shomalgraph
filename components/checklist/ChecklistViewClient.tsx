"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistItemCard } from "@/components/checklist/ChecklistItemCard";
import Link from "next/link";
import { Edit, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { fa } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistViewClientProps {
  checklist: {
    id: string;
    title: string;
    description?: string | null;
    travelType?: string | null;
    createdAt: Date;
    template?: {
      id: string;
      title: string;
      icon?: string | null;
    } | null;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      isRequired: boolean;
      isChecked: boolean;
      notes?: string | null;
      order: number;
    }>;
    progress: number;
    checkedCount: number;
    totalCount: number;
  };
}

export function ChecklistViewClient({ checklist: initialChecklist }: ChecklistViewClientProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemDescription, setEditingItemDescription] = useState("");

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      const response = await fetch(
        `/api/checklists/${checklist.id}/items/${itemId}/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isChecked }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در تغییر وضعیت");
      }

      // به‌روزرسانی state
      setChecklist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? { ...item, isChecked: data.data.item.isChecked }
            : item
        ),
        progress: data.data.progress,
        checkedCount: data.data.checkedCount,
        totalCount: data.data.totalCount,
      }));
    } catch (error) {
      console.error("Error toggling item:", error);
      alert("خطا در تغییر وضعیت آیتم");
    }
  };

  const handleEditNotes = async (itemId: string, notes: string) => {
    try {
      const response = await fetch(
        `/api/checklists/${checklist.id}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ذخیره یادداشت");
      }

      // به‌روزرسانی state
      setChecklist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, notes: data.data.notes } : item
        ),
      }));
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("خطا در ذخیره یادداشت");
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert("نام آیتم الزامی است");
      return;
    }

    try {
      const response = await fetch(`/api/checklists/${checklist.id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDescription || undefined,
          isRequired: newItemRequired,
          order: checklist.items.length,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در اضافه کردن آیتم");
      }

      setChecklist((prev) => ({
        ...prev,
        items: [...prev.items, data.data],
        totalCount: prev.totalCount + 1,
      }));

      setNewItemName("");
      setNewItemDescription("");
      setNewItemRequired(false);
      setIsAddItemDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("خطا در اضافه کردن آیتم");
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editingItemName.trim()) {
      alert("نام آیتم الزامی است");
      return;
    }

    try {
      const response = await fetch(
        `/api/checklists/${checklist.id}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingItemName,
            description: editingItemDescription || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در به‌روزرسانی آیتم");
      }

      setChecklist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: data.data.name,
                description: data.data.description,
              }
            : item
        ),
      }));

      setEditingItemId(null);
      setEditingItemName("");
      setEditingItemDescription("");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("خطا در به‌روزرسانی آیتم");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/checklists/${checklist.id}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف آیتم");
      }

      setChecklist((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
        totalCount: prev.totalCount - 1,
      }));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("خطا در حذف آیتم");
    }
  };

  const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {checklist.template && (
            <Badge variant="secondary" className="text-xs mb-2">
              از قالب: {checklist.template.title}
            </Badge>
          )}
          <h1 className="text-3xl font-black mb-2">{checklist.title}</h1>
          {checklist.description && (
            <p className="text-muted-foreground">{checklist.description}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(checklist.createdAt), "d MMMM yyyy", {
                locale: fa,
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditMode ? "ذخیره" : "ویرایش لیست"}
          </Button>
          <Link href={`/checklists/${checklist.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              ویرایش جزئیات
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>پیشرفت</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistProgress
            checkedCount={checklist.checkedCount}
            totalCount={checklist.totalCount}
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>آیتم‌ها</CardTitle>
            {isEditMode && (
              <Dialog
                open={isAddItemDialogOpen}
                onOpenChange={setIsAddItemDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    افزودن آیتم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>افزودن آیتم</DialogTitle>
                    <DialogDescription>
                      یک آیتم جدید به چک‌لیست اضافه کنید
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>نام آیتم *</Label>
                      <Input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="مثلاً: مسواک"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>توضیحات</Label>
                      <Textarea
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="توضیحات اختیاری..."
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="required"
                        checked={newItemRequired}
                        onCheckedChange={(checked) =>
                          setNewItemRequired(checked === true)
                        }
                      />
                      <Label htmlFor="required" className="cursor-pointer">
                        آیتم ضروری
                      </Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddItemDialogOpen(false)}
                      >
                        انصراف
                      </Button>
                      <Button onClick={handleAddItem}>افزودن</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>این چک‌لیست هنوز آیتمی ندارد</p>
                {isEditMode && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddItemDialogOpen(true)}
                  >
                    افزودن اولین آیتم
                  </Button>
                )}
              </div>
            ) : (
              sortedItems.map((item) => (
                <div key={item.id}>
                  {editingItemId === item.id ? (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-2">
                          <Label>نام آیتم *</Label>
                          <Input
                            value={editingItemName}
                            onChange={(e) => setEditingItemName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>توضیحات</Label>
                          <Textarea
                            value={editingItemDescription}
                            onChange={(e) =>
                              setEditingItemDescription(e.target.value)
                            }
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingItemName("");
                              setEditingItemDescription("");
                            }}
                          >
                            انصراف
                          </Button>
                          <Button onClick={() => handleUpdateItem(item.id)}>
                            ذخیره
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="relative">
                      <ChecklistItemCard
                        item={item}
                        onToggle={handleToggleItem}
                        onEditNotes={handleEditNotes}
                        readOnly={false}
                      />
                      {isEditMode && (
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditingItemName(item.name);
                              setEditingItemDescription(item.description || "");
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
