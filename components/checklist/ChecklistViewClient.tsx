"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistItemCard } from "@/components/checklist/ChecklistItemCard";
import Link from "next/link";
import { Edit, Calendar, Plus, LayoutGrid, List, FileText, CheckSquare, Square, X } from "lucide-react";
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
    notes?: string | null;
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
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [checklistNotes, setChecklistNotes] = useState(checklist.notes || "");
  
  // حالت نمایشی ساده/کامل - ذخیره در local storage
  // مقدار اولیه همیشه false است تا از hydration mismatch جلوگیری شود
  const [isMinimalView, setIsMinimalView] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // خواندن از localStorage فقط در کلاینت (بعد از mount)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(`checklist-view-${checklist.id}`);
    if (saved === "minimal") {
      setIsMinimalView(true);
    }
  }, [checklist.id]);

  // ذخیره در localStorage هنگام تغییر
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(`checklist-view-${checklist.id}`, isMinimalView ? "minimal" : "full");
    }
  }, [isMinimalView, checklist.id, isMounted]);

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

  const handleToggleAll = async (isChecked: boolean) => {
    try {
      // Toggle همه آیتم‌ها به صورت موازی
      const promises = checklist.items.map((item) =>
        fetch(`/api/checklists/${checklist.id}/items/${item.id}/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isChecked }),
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(
        responses.map((res) => res.json())
      );

      // بررسی خطا
      const hasError = results.some((result) => !result.success);
      if (hasError) {
        throw new Error("خطا در تغییر وضعیت برخی آیتم‌ها");
      }

      // دریافت آیتم‌های به‌روزرسانی شده و محاسبه progress
      const updatedItemsResponse = await fetch(
        `/api/checklists/${checklist.id}/items`
      );
      const updatedItemsData = await updatedItemsResponse.json();

      if (updatedItemsData.success) {
        const checkedCount = updatedItemsData.data.filter(
          (item: { isChecked: boolean }) => item.isChecked
        ).length;
        const totalCount = updatedItemsData.data.length;
        const progress =
          totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

        setChecklist((prev) => ({
          ...prev,
          items: updatedItemsData.data,
          progress: Math.round(progress),
          checkedCount,
          totalCount,
        }));
      }
    } catch (error) {
      console.error("Error toggling all items:", error);
      alert("خطا در تغییر وضعیت آیتم‌ها");
    }
  };

  const handleUpdateChecklistNotes = async () => {
    try {
      const response = await fetch(`/api/checklists/${checklist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: checklistNotes }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ذخیره یادداشت");
      }

      setChecklist((prev) => ({
        ...prev,
        notes: data.data.notes,
      }));
      setIsNotesDialogOpen(false);
    } catch (error) {
      console.error("Error updating checklist notes:", error);
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

  // مرتب‌سازی: آیتم‌های چک نشده اول، سپس چک شده‌ها
  const sortedItems = [...checklist.items].sort((a, b) => {
    if (a.isChecked === b.isChecked) {
      return a.order - b.order;
    }
    return a.isChecked ? 1 : -1; // چک نشده‌ها اول
  });

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {checklist.template && (
            <Badge variant="secondary" className="text-xs mb-2">
              از قالب: {checklist.template.title}
            </Badge>
          )}
          <h1 className="text-2xl sm:text-3xl font-black mb-2 break-words">{checklist.title}</h1>
          {checklist.description && (
            <p className="text-muted-foreground break-words">{checklist.description}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {format(new Date(checklist.createdAt), "d MMMM yyyy", {
                locale: fa,
              })}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMinimalView(!isMinimalView)}
            className="gap-2"
            title={isMinimalView ? "نمایش کامل" : "نمایش ساده"}
          >
            {isMinimalView ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNotesDialogOpen(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">یادداشت</span>
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">{isEditMode ? "ذخیره" : "ویرایش لیست"}</span>
            <span className="sm:hidden">{isEditMode ? "ذخیره" : "ویرایش"}</span>
          </Button>
          <Link href={`/checklists/${checklist.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">ویرایش جزئیات</span>
              <span className="sm:hidden">جزئیات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notes */}
      {checklist.notes && !isMinimalView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              یادداشت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{checklist.notes}</p>
          </CardContent>
        </Card>
      )}

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
            {!isMinimalView && <CardTitle>آیتم‌ها</CardTitle>}
            <div className="flex gap-2">
              {checklist.items.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const allChecked = checklist.items.every((item) => item.isChecked);
                    const action = allChecked ? "پاک کردن" : "علامت زدن";
                    if (
                      confirm(
                        `آیا مطمئن هستید که می‌خواهید همه آیتم‌ها را ${action} کنید؟`
                      )
                    ) {
                      await handleToggleAll(!allChecked);
                    }
                  }}
                  className="gap-2"
                  title={
                    checklist.items.every((item) => item.isChecked)
                      ? "پاک کردن همه"
                      : "علامت زدن همه"
                  }
                >
                  {checklist.items.every((item) => item.isChecked) ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <CheckSquare className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {checklist.items.every((item) => item.isChecked)
                      ? "پاک کردن همه"
                      : "علامت زدن همه"}
                  </span>
                </Button>
              )}
              {isEditMode && !isMinimalView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAddItemDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  افزودن آیتم
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-hidden">
          <div className={isMinimalView ? "space-y-0" : "space-y-3"}>
            {sortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>این چک‌لیست هنوز آیتمی ندارد</p>
                {isEditMode && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddItemDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    افزودن اولین آیتم
                  </Button>
                )}
              </div>
            ) : (
              sortedItems.map((item) => (
                <div key={item.id} className="w-full overflow-x-hidden">
                  {editingItemId === item.id ? (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-2">
                          <Label>نام آیتم *</Label>
                          <Input
                            value={editingItemName}
                            onChange={(e) => setEditingItemName(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        {!isMinimalView && (
                          <div className="space-y-2">
                            <Label>توضیحات</Label>
                            <Textarea
                              value={editingItemDescription}
                              onChange={(e) =>
                                setEditingItemDescription(e.target.value)
                              }
                              rows={2}
                              className="w-full"
                            />
                          </div>
                        )}
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
                    <div className="relative w-full overflow-x-hidden">
                      <ChecklistItemCard
                        item={item}
                        onToggle={handleToggleItem}
                        readOnly={false}
                        minimal={isMinimalView}
                      />
                      {isEditMode && !isMinimalView && (
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
                            title="ویرایش"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="حذف"
                          >
                            <X className="h-4 w-4" />
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

      {/* Dialog for adding new item */}
      <Dialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
      >
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

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>یادداشت چک‌لیست</DialogTitle>
            <DialogDescription>
              یادداشت کلی خود را برای این چک‌لیست بنویسید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={checklistNotes}
              onChange={(e) => setChecklistNotes(e.target.value)}
              placeholder="یادداشت خود را بنویسید..."
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNotesDialogOpen(false);
                  setChecklistNotes(checklist.notes || "");
                }}
              >
                انصراف
              </Button>
              <Button onClick={handleUpdateChecklistNotes}>ذخیره</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button - Add Item */}
      <Button
        onClick={() => setIsAddItemDialogOpen(true)}
        size="lg"
        className="fixed bottom-20 left-6 h-12 w-12 rounded-full shadow-lg z-50 hover:shadow-xl transition-shadow md:bottom-6"
        title="افزودن آیتم جدید"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
