"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit, 
  Ban, 
  Shield, 
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  censoredContent: string;
  hasBadWords: boolean;
  status: string;
  itemType: string;
  user: {
    id: string;
    name: string | null;
    phone: string;
    avatar: string | null;
    score: number;
    isCommentBanned: boolean;
    commentBanUntil: Date | null;
    isPlaceAddBanned: boolean;
    placeAddBanUntil: Date | null;
  };
  restaurant?: { name: string; slug: string } | null;
  place?: { name: string; slug: string } | null;
  checklist?: { title: string } | null;
  likeCount: number;
  reportCount: number;
  createdAt: Date;
}

interface CommentsManagementClientProps {
  initialComments: Comment[];
}

export function CommentsManagementClient({
  initialComments,
}: CommentsManagementClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBadWords, setFilterBadWords] = useState<boolean | null>(null);
  const [filterHighReports, setFilterHighReports] = useState<boolean>(false);
  const [filterNegativeScore, setFilterNegativeScore] = useState<boolean>(false);
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [banDays, setBanDays] = useState<string>("7");
  const [banType, setBanType] = useState<"comment" | "place" | "both">("comment");
  const [scoreAdjustment, setScoreAdjustment] = useState<string>("0");
  const [scoreReason, setScoreReason] = useState<string>("");

  // فیلتر کردن کامنت‌ها
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      // فیلتر وضعیت
      if (filterStatus !== "all" && comment.status !== filterStatus) {
        return false;
      }

      // فیلتر کلمات بد
      if (filterBadWords !== null) {
        if (filterBadWords && !comment.hasBadWords) return false;
        if (!filterBadWords && comment.hasBadWords) return false;
      }

      // فیلتر ریپورت بالا
      if (filterHighReports && comment.reportCount < 3) {
        return false;
      }

      // فیلتر امتیاز منفی
      if (filterNegativeScore && comment.user.score >= 0) {
        return false;
      }

      // فیلتر بازه زمانی
      if (filterTimeRange !== "all") {
        const commentDate = new Date(comment.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
        const timeRangeHours = parseInt(filterTimeRange);
        
        if (hoursDiff > timeRangeHours) {
          return false;
        }
      }

      // جستجو
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesContent = 
          comment.content.toLowerCase().includes(query) ||
          comment.censoredContent.toLowerCase().includes(query) ||
          comment.user.name?.toLowerCase().includes(query) ||
          comment.user.phone.includes(query);
        if (!matchesContent) return false;
      }

      return true;
    });
  }, [comments, filterStatus, filterBadWords, filterHighReports, filterNegativeScore, filterTimeRange, searchQuery]);

  const handleStatusChange = async (commentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert(data.error || "خطا در به‌روزرسانی");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("خطا در به‌روزرسانی");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        alert(data.error || "خطا در حذف");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("خطا در حذف");
    }
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId 
              ? { ...c, content: newContent, censoredContent: newContent } 
              : c
          )
        );
        setIsEditDialogOpen(false);
        setSelectedComment(null);
      } else {
        alert(data.error || "خطا در ویرایش");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("خطا در ویرایش");
    }
  };

  const handleBan = async () => {
    if (!selectedComment) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedComment.user.id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          days: parseInt(banDays),
          type: banType,
          reason: `مهار کاربر به دلیل کامنت: ${selectedComment.id}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // به‌روزرسانی اطلاعات کاربر در کامنت
        setComments(
          comments.map((c) =>
            c.user.id === selectedComment.user.id
              ? {
                  ...c,
                  user: {
                    ...c.user,
                    isCommentBanned: banType === "comment" || banType === "both" ? true : c.user.isCommentBanned,
                    commentBanUntil: banType === "comment" || banType === "both" 
                      ? new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000)
                      : c.user.commentBanUntil,
                    isPlaceAddBanned: banType === "place" || banType === "both" ? true : c.user.isPlaceAddBanned,
                    placeAddBanUntil: banType === "place" || banType === "both"
                      ? new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000)
                      : c.user.placeAddBanUntil,
                  },
                }
              : c
          )
        );
        setIsBanDialogOpen(false);
        setSelectedComment(null);
        setBanDays("7");
        setBanType("comment");
      } else {
        alert(data.error || "خطا در مهار کاربر");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      alert("خطا در مهار کاربر");
    }
  };

  const handleScoreAdjustment = async () => {
    if (!selectedComment) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedComment.user.id}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustment: parseInt(scoreAdjustment),
          reason: scoreReason || "تنظیم دستی امتیاز توسط ادمین",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // به‌روزرسانی امتیاز کاربر در کامنت
        setComments(
          comments.map((c) =>
            c.user.id === selectedComment.user.id
              ? {
                  ...c,
                  user: {
                    ...c.user,
                    score: data.newScore,
                  },
                }
              : c
          )
        );
        setIsScoreDialogOpen(false);
        setSelectedComment(null);
        setScoreAdjustment("0");
        setScoreReason("");
      } else {
        alert(data.error || "خطا در تنظیم امتیاز");
      }
    } catch (error) {
      console.error("Error adjusting score:", error);
      alert("خطا در تنظیم امتیاز");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "CENSORED":
        return "bg-orange-100 text-orange-700";
      case "HIDDEN":
        return "bg-gray-100 text-gray-700";
      case "DELETED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "فعال";
      case "CENSORED":
        return "فیلتر شده";
      case "HIDDEN":
        return "مخفی";
      case "DELETED":
        return "حذف شده";
      default:
        return status;
    }
  };

  const getItemName = (comment: Comment) => {
    if (comment.restaurant) return comment.restaurant.name;
    if (comment.place) return comment.place.name;
    if (comment.checklist) return comment.checklist.title;
    return "نامشخص";
  };

  const activeFiltersCount = [
    filterStatus !== "all",
    filterBadWords !== null,
    filterHighReports,
    filterNegativeScore,
    filterTimeRange !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* فیلترها */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              فیلترها
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
      setFilterStatus("all");
      setFilterBadWords(null);
      setFilterHighReports(false);
      setFilterNegativeScore(false);
      setFilterTimeRange("all");
      setSearchQuery("");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>وضعیت</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="ACTIVE">فعال</SelectItem>
                  <SelectItem value="CENSORED">فیلتر شده</SelectItem>
                  <SelectItem value="HIDDEN">مخفی</SelectItem>
                  <SelectItem value="DELETED">حذف شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>کلمات بد</Label>
              <Select
                value={filterBadWords === null ? "all" : filterBadWords ? "yes" : "no"}
                onValueChange={(value) => {
                  if (value === "all") setFilterBadWords(null);
                  else setFilterBadWords(value === "yes");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="yes">دارد</SelectItem>
                  <SelectItem value="no">ندارد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterHighReports}
                  onChange={(e) => setFilterHighReports(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">ریپورت بالا (≥3)</span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterNegativeScore}
                  onChange={(e) => setFilterNegativeScore(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">امتیاز منفی</span>
              </label>
            </div>
            <div>
              <Label>بازه زمانی</Label>
              <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه زمان‌ها</SelectItem>
                  <SelectItem value="1">آخرین 1 ساعت</SelectItem>
                  <SelectItem value="3">آخرین 3 ساعت</SelectItem>
                  <SelectItem value="5">آخرین 5 ساعت</SelectItem>
                  <SelectItem value="24">آخرین 24 ساعت</SelectItem>
                  <SelectItem value="48">آخرین 48 ساعت</SelectItem>
                  <SelectItem value="72">آخرین 72 ساعت</SelectItem>
                  <SelectItem value="150">آخرین 150 ساعت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>جستجو</Label>
              <Input
                placeholder="جستجو در کامنت‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* لیست کامنت‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>
            کامنت‌ها ({filteredComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کاربر</TableHead>
                  <TableHead>محتوا</TableHead>
                  <TableHead>آیتم</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>لایک / ریپورت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      کامنتی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {comment.user.name || "کاربر ناشناس"}
                            {comment.user.score < 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {comment.user.score}
                              </Badge>
                            )}
                            {comment.user.isCommentBanned && (
                              <Badge variant="outline" className="text-xs border-red-500 text-red-600">
                                <Ban className="h-3 w-3 mr-1" />
                                ممنوع
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {comment.user.phone}
                          </div>
                          {comment.user.commentBanUntil && (
                            <div className="text-xs text-red-600 mt-1">
                              تا: {new Date(comment.user.commentBanUntil).toLocaleDateString("fa-IR")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="text-sm">
                            {comment.hasBadWords ? (
                              <>
                                <div className="text-orange-600 mb-1">
                                  {comment.censoredContent}
                                </div>
                                <details className="text-xs text-muted-foreground">
                                  <summary className="cursor-pointer">نمایش نسخه اصلی</summary>
                                  <div className="mt-1 p-2 bg-gray-50 rounded">
                                    {comment.content}
                                  </div>
                                </details>
                              </>
                            ) : (
                              comment.content
                            )}
                          </div>
                          {comment.hasBadWords && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              کلمات بد
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{getItemName(comment)}</div>
                          <div className="text-xs text-muted-foreground">
                            {comment.itemType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={comment.status}
                          onValueChange={(value) =>
                            handleStatusChange(comment.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">فعال</SelectItem>
                            <SelectItem value="CENSORED">فیلتر شده</SelectItem>
                            <SelectItem value="HIDDEN">مخفی</SelectItem>
                            <SelectItem value="DELETED">حذف شده</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span>❤️</span>
                            <span>{comment.likeCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🚩</span>
                            <span>{comment.reportCount}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: faIR,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog
                            open={isEditDialogOpen && selectedComment?.id === comment.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (open) {
                                setSelectedComment(comment);
                              } else {
                                setSelectedComment(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedComment(comment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>ویرایش کامنت</DialogTitle>
                                <DialogDescription>
                                  محتوای کامنت را ویرایش کنید
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>محتوا</Label>
                                  <Textarea
                                    defaultValue={comment.content}
                                    className="mt-1"
                                    rows={5}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditDialogOpen(false)}
                                >
                                  انصراف
                                </Button>
                                <Button
                                  onClick={() => {
                                    const textarea = document.querySelector("textarea");
                                    if (textarea) {
                                      handleEdit(comment.id, textarea.value);
                                    }
                                  }}
                                >
                                  ذخیره
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isBanDialogOpen && selectedComment?.id === comment.id}
                            onOpenChange={(open) => {
                              setIsBanDialogOpen(open);
                              if (open) {
                                setSelectedComment(comment);
                              } else {
                                setSelectedComment(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600"
                                onClick={() => setSelectedComment(comment)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>مهار کاربر</DialogTitle>
                                <DialogDescription>
                                  کاربر: {comment.user.name || comment.user.phone}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>نوع مهار</Label>
                                  <Select value={banType} onValueChange={(value: "comment" | "place") => setBanType(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="comment">ممنوعیت کامنت</SelectItem>
                                      <SelectItem value="place">ممنوعیت اضافه کردن مکان</SelectItem>
                                      <SelectItem value="both">هر دو</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>تعداد روز</Label>
                                  <Input
                                    type="number"
                                    value={banDays}
                                    onChange={(e) => setBanDays(e.target.value)}
                                    min="1"
                                    max="365"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsBanDialogOpen(false)}
                                >
                                  انصراف
                                </Button>
                                <Button onClick={handleBan} className="bg-orange-600">
                                  مهار کاربر
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isScoreDialogOpen && selectedComment?.id === comment.id}
                            onOpenChange={(open) => {
                              setIsScoreDialogOpen(open);
                              if (open) {
                                setSelectedComment(comment);
                              } else {
                                setSelectedComment(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => setSelectedComment(comment)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تنظیم امتیاز کاربر</DialogTitle>
                                <DialogDescription>
                                  کاربر: {comment.user.name || comment.user.phone}
                                  <br />
                                  امتیاز فعلی: {comment.user.score}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>تغییر امتیاز (مثبت یا منفی)</Label>
                                  <Input
                                    type="number"
                                    value={scoreAdjustment}
                                    onChange={(e) => setScoreAdjustment(e.target.value)}
                                    placeholder="مثلاً: -10 یا +5"
                                  />
                                </div>
                                <div>
                                  <Label>دلیل</Label>
                                  <Textarea
                                    value={scoreReason}
                                    onChange={(e) => setScoreReason(e.target.value)}
                                    placeholder="دلیل تغییر امتیاز..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsScoreDialogOpen(false)}
                                >
                                  انصراف
                                </Button>
                                <Button onClick={handleScoreAdjustment}>
                                  اعمال تغییر
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف کامنت</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟
                                  این عمل قابل بازگشت نیست و امتیاز منفی به نویسنده اعمال می‌شود.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(comment.id)}
                                  className="bg-red-600"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
