"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Shield, Filter, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface BadWord {
  id: string;
  word: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BadWordsClientProps {
  initialBadWords: BadWord[];
}

export function BadWordsClient({ initialBadWords }: BadWordsClientProps) {
  const [badWords, setBadWords] = useState<BadWord[]>(initialBadWords);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<BadWord | null>(null);
  const [formData, setFormData] = useState({
    word: "",
    severity: "MODERATE" as "MILD" | "MODERATE" | "SEVERE",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // فیلتر کردن کلمات بر اساس سطح حساسیت
  const filteredBadWords = badWords.filter((word) => {
    if (filterSeverity === "all") return true;
    return word.severity === filterSeverity;
  });

  const handleOpenDialog = (word?: BadWord) => {
    if (word) {
      setEditingWord(word);
      setFormData({
        word: word.word,
        severity: word.severity,
        isActive: word.isActive,
      });
    } else {
      setEditingWord(null);
      setFormData({
        word: "",
        severity: "MODERATE",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWord(null);
    setFormData({
      word: "",
      severity: "MODERATE",
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingWord
        ? `/api/admin/bad-words/${editingWord.id}`
        : "/api/admin/bad-words";
      const method = editingWord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در ذخیره کلمه");
      }

      // به‌روزرسانی لیست
      if (editingWord) {
        setBadWords(
          badWords.map((w) => (w.id === editingWord.id ? data.data : w))
        );
      } else {
        setBadWords([...badWords, data.data]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving bad word:", error);
      alert(error instanceof Error ? error.message : "خطا در ذخیره کلمه");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این کلمه را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bad-words/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در حذف کلمه");
      }

      setBadWords(badWords.filter((w) => w.id !== id));
    } catch (error) {
      console.error("Error deleting bad word:", error);
      alert(error instanceof Error ? error.message : "خطا در حذف کلمه");
    }
  };

  const handleToggleActive = async (word: BadWord) => {
    try {
      const response = await fetch(`/api/admin/bad-words/${word.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !word.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "خطا در به‌روزرسانی");
      }

      setBadWords(
        badWords.map((w) => (w.id === word.id ? data.data : w))
      );
    } catch (error) {
      console.error("Error toggling bad word:", error);
      alert(error instanceof Error ? error.message : "خطا در به‌روزرسانی");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "MILD":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "MODERATE":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "SEVERE":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "MILD":
        return "خفیف";
      case "MODERATE":
        return "متوسط";
      case "SEVERE":
        return "شدید";
      default:
        return severity;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>لیست کلمات بد</CardTitle>
              <CardDescription>
                مدیریت کلمات نامناسب که در کامنت‌ها فیلتر می‌شوند
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              افزودن کلمه
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* فیلتر سطح حساسیت */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label>فیلتر بر اساس سطح حساسیت:</Label>
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="MILD">خفیف</SelectItem>
                <SelectItem value="MODERATE">متوسط</SelectItem>
                <SelectItem value="SEVERE">شدید</SelectItem>
              </SelectContent>
            </Select>
            {filterSeverity !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterSeverity("all")}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                پاک کردن فیلتر
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کلمه</TableHead>
                <TableHead>سطح حساسیت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBadWords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {badWords.length === 0
                          ? "هنوز کلمه‌ای اضافه نشده است"
                          : "کلمه‌ای با این فیلتر یافت نشد"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBadWords.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(word.severity)}>
                        {getSeverityLabel(word.severity)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={word.isActive}
                        onCheckedChange={() => handleToggleActive(word)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(word)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(word.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWord ? "ویرایش کلمه" : "افزودن کلمه جدید"}
            </DialogTitle>
            <DialogDescription>
              کلمه‌ای که می‌خواهید در کامنت‌ها فیلتر شود را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="word">کلمه *</Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  placeholder="مثال: کلمه نامناسب"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">سطح حساسیت *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      severity: value as "MILD" | "MODERATE" | "SEVERE",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MILD">خفیف</SelectItem>
                    <SelectItem value="MODERATE">متوسط</SelectItem>
                    <SelectItem value="SEVERE">شدید</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">فعال</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "در حال ذخیره..." : "ذخیره"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

