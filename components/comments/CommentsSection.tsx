"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Flag, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Comment {
  id: string;
  content: string;
  hasBadWords: boolean;
  status: string;
  likeCount: number;
  reportCount: number;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  createdAt: string;
  isLiked: boolean;
}

interface CommentsSectionProps {
  itemType: "RESTAURANT" | "PLACE" | "CHECKLIST";
  restaurantId?: string;
  placeId?: string;
  checklistId?: string;
}

export function CommentsSection({
  itemType,
  restaurantId,
  placeId,
  checklistId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(
    null
  );
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "top">("top");

  const fetchComments = useCallback(async (limit?: number, sort?: "newest" | "top") => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        itemType,
        ...(restaurantId && { restaurantId }),
        ...(placeId && { placeId }),
        ...(checklistId && { checklistId }),
        ...(limit && { limit: limit.toString() }),
        ...(sort && { sort }),
      });

      // کاهش timeout برای پاسخ سریع‌تر
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`/api/comments?${params}`, {
        signal: controller.signal,
        // برای client component، cache را در browser انجام می‌دهیم
        cache: "default",
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      const data = await response.json();

      if (data.success) {
        if (limit) {
          // برای نمایش 2 کامنت برتر
          setComments(data.data);
        } else {
          // برای نمایش همه کامنت‌ها
          setAllComments(data.data);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching comments:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemType, restaurantId, placeId, checklistId]);

  useEffect(() => {
    // بارگذاری 2 کامنت برتر به صورت پیش‌فرض
    fetchComments(2, "top");
  }, [fetchComments]);

  useEffect(() => {
    // وقتی showAll فعال می‌شود، همه کامنت‌ها را بارگذاری کن
    if (showAll) {
      fetchComments(undefined, sortBy);
    }
  }, [showAll, sortBy, fetchComments]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          restaurantId,
          placeId,
          checklistId,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment("");
        // به‌روزرسانی فوری بدون fetch مجدد
        setComments((prev) => [data.data, ...prev]);
        setAllComments((prev) => [data.data, ...prev]);
        // بارگذاری مجدد برای به‌روزرسانی ترتیب
        if (showAll) {
          fetchComments(undefined, sortBy);
        } else {
          fetchComments(2, "top");
        }
      } else {
        alert(data.error || "خطا در ارسال کامنت");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("خطا در ارسال کامنت");
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, itemType, restaurantId, placeId, checklistId]);

  const handleLike = useCallback(async (commentId: string) => {
    try {
      // Optimistic update
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likeCount: comment.isLiked
                ? comment.likeCount - 1
                : comment.likeCount + 1,
            };
          }
          return comment;
        })
      );

      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        // Rollback on error
        if (showAll) {
          fetchComments(undefined, sortBy);
        } else {
          fetchComments(2, "top");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback on error
      fetchComments();
    }
  }, [fetchComments]);

  const handleReport = async (commentId: string) => {
    if (!reportReason) {
      alert("لطفاً دلیل ریپورت را انتخاب کنید");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reportReason }),
      });

      const data = await response.json();

      if (data.success) {
        alert("ریپورت با موفقیت ثبت شد");
        setReportingCommentId(null);
        setReportReason("");
        if (showAll) {
          fetchComments(undefined, sortBy);
        } else {
          fetchComments(2, "top");
        }
      } else {
        alert(data.error || "خطا در ثبت ریپورت");
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("خطا در ثبت ریپورت");
    }
  };

  // انتخاب کامنت‌های نمایش داده شده - memoize برای جلوگیری از re-render
  const displayedComments = useMemo(() => {
    return showAll ? allComments : comments;
  }, [showAll, allComments, comments]);

  // Memoize handlers برای جلوگیری از re-render
  const handleLikeMemo = useCallback(
    (commentId: string) => handleLike(commentId),
    [handleLike]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="mr-2 text-sm text-muted-foreground">در حال بارگذاری کامنت‌ها...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* فرم ارسال کامنت */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    ارسال
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* لیست کامنت‌ها */}
      <div className="space-y-4">
        {showAll && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">همه کامنت‌ها</h3>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: "newest" | "top") => {
                setSortBy(value);
                fetchComments(undefined, value);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">امتیاز بالا</SelectItem>
                  <SelectItem value="newest">جدیدترین</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAll(false);
                  fetchComments(2, "top");
                }}
              >
                بستن
              </Button>
            </div>
          </div>
        )}
        
        {displayedComments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              هنوز کامنتی ثبت نشده است
            </CardContent>
          </Card>
        ) : (
          <>
            {displayedComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>
                      {comment.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {comment.user.name || "کاربر ناشناس"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {comment.hasBadWords && (
                        <span className="text-xs text-orange-600">
                          (فیلتر شده)
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id)}
                        className={comment.isLiked ? "text-red-600" : ""}
                      >
                        <Heart
                          className={`ml-1 h-4 w-4 ${
                            comment.isLiked ? "fill-current" : ""
                          }`}
                        />
                        {comment.likeCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReportingCommentId(comment.id)}
                      >
                        <Flag className="ml-1 h-4 w-4" />
                        ریپورت
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
            
            {!showAll && comments.length > 0 && (
              <Card>
                <CardContent className="py-6 text-center">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setShowAll(true);
                      await fetchComments(undefined, sortBy);
                    }}
                  >
                    مشاهده همه کامنت‌ها
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Dialog ریپورت */}
      <Dialog
        open={!!reportingCommentId}
        onOpenChange={(open) => {
          if (!open) {
            setReportingCommentId(null);
            setReportReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ریپورت کامنت</DialogTitle>
            <DialogDescription>
              دلیل ریپورت این کامنت را انتخاب کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="دلیل ریپورت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFFENSIVE_CONTENT">
                  محتوای توهین‌آمیز
                </SelectItem>
                <SelectItem value="SPAM">اسپم</SelectItem>
                <SelectItem value="ADVERTISEMENT">تبلیغات</SelectItem>
                <SelectItem value="FALSE_INFO">اطلاعات غلط</SelectItem>
                <SelectItem value="BAD_WORDS">کلمات بد</SelectItem>
                <SelectItem value="OTHER">دیگر موارد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportingCommentId(null);
                setReportReason("");
              }}
            >
              انصراف
            </Button>
            <Button
              onClick={() =>
                reportingCommentId && handleReport(reportingCommentId)
              }
              disabled={!reportReason}
            >
              ثبت ریپورت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

