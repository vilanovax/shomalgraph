"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistEditClientProps {
  checklist: {
    id: string;
    title: string;
    description?: string | null;
    travelType?: string | null;
    season?: string | null;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      isRequired: boolean;
      order: number;
    }>;
  };
}

export function ChecklistEditClient({ checklist: initialChecklist }: ChecklistEditClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemDescription, setEditingItemDescription] = useState("");
  const [editingItemRequired, setEditingItemRequired] = useState(false);

  const handleSaveChecklist = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/checklists/${checklist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: checklist.title,
          description: checklist.description,
          travelType: checklist.travelType,
          season: checklist.season,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ذخیره");
      }

      router.push(`/checklists/${checklist.id}`);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در ذخیره"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      setError("نام آیتم الزامی است");
      return;
    }

    setIsLoading(true);
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
      }));

      setNewItemName("");
      setNewItemDescription("");
      setNewItemRequired(false);
      setIsItemDialogOpen(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در اضافه کردن آیتم"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editingItemName.trim()) {
      setError("نام آیتم الزامی است");
      return;
    }

    setIsLoading(true);
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
            isRequired: editingItemRequired,
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
                isRequired: data.data.isRequired,
              }
            : item
        ),
      }));

      setEditingItemId(null);
      setEditingItemName("");
      setEditingItemDescription("");
      setEditingItemRequired(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "خطا در به‌روزرسانی آیتم"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setIsLoading(true);
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
      }));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "خطا در حذف آیتم");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Edit2 className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>ویرایش چک‌لیست</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* عنوان */}
          <div className="space-y-2">
            <Label>عنوان *</Label>
            <Input
              value={checklist.title}
              onChange={(e) =>
                setChecklist({ ...checklist, title: e.target.value })
              }
              required
            />
          </div>

          {/* توضیحات */}
          <div className="space-y-2">
            <Label>توضیحات</Label>
            <Textarea
              value={checklist.description || ""}
              onChange={(e) =>
                setChecklist({ ...checklist, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* نوع سفر */}
          <div className="space-y-2">
            <Label>نوع سفر</Label>
            <Select
              value={checklist.travelType || ""}
              onValueChange={(value) =>
                setChecklist({ ...checklist, travelType: value || null })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">هیچکدام</SelectItem>
                <SelectItem value="FAMILY_WITH_KIDS">خانواده با بچه</SelectItem>
                <SelectItem value="NATURE">طبیعت</SelectItem>
                <SelectItem value="BEACH">ساحل</SelectItem>
                <SelectItem value="URBAN">شهری</SelectItem>
                <SelectItem value="COUPLE">زوج</SelectItem>
                <SelectItem value="FRIENDS">دوستان</SelectItem>
                <SelectItem value="SOLO">تنها</SelectItem>
                <SelectItem value="OTHER">سایر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSaveChecklist}
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            ذخیره تغییرات
          </Button>
        </CardContent>
      </Card>

      {/* آیتم‌ها */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>آیتم‌های چک‌لیست</CardTitle>
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
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
                      onClick={() => setIsItemDialogOpen(false)}
                    >
                      انصراف
                    </Button>
                    <Button onClick={handleAddItem} disabled={isLoading}>
                      افزودن
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>این چک‌لیست هنوز آیتمی ندارد</p>
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
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`required-${item.id}`}
                            checked={editingItemRequired}
                            onCheckedChange={(checked) =>
                              setEditingItemRequired(checked === true)
                            }
                          />
                          <Label
                            htmlFor={`required-${item.id}`}
                            className="cursor-pointer"
                          >
                            آیتم ضروری
                          </Label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingItemName("");
                              setEditingItemDescription("");
                              setEditingItemRequired(false);
                            }}
                          >
                            انصراف
                          </Button>
                          <Button
                            onClick={() => handleUpdateItem(item.id)}
                            disabled={isLoading}
                          >
                            ذخیره
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        {item.isRequired && (
                          <span className="text-xs text-red-500 mt-1">
                            ضروری
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingItemName(item.name);
                            setEditingItemDescription(item.description || "");
                            setEditingItemRequired(item.isRequired);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف آیتم</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا مطمئن هستید که می‌خواهید این آیتم را حذف
                                کنید؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
