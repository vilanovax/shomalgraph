"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Heart, Flag, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  comment: string;
  user: {
    name: string | null;
  };
  createdAt: string;
  _count: {
    likes: number;
    reports: number;
  };
}

interface CommentsSectionProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsSection({ itemId, isOpen, onClose }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId && isOpen) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, isOpen]);

  const fetchComments = async () => {
    if (!itemId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/explore/items/comments?itemId=${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!itemId || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/explore/items/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, comment: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/explore/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      if (res.ok) {
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleReportComment = async (commentId: string, reason: string) => {
    try {
      const res = await fetch("/api/explore/comments/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, reason }),
      });

      if (res.ok) {
        alert("نظر با موفقیت گزارش شد");
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>نظرات</DialogTitle>
          <DialogDescription>
            نظرات کاربران درباره این آیتم
          </DialogDescription>
        </DialogHeader>

        {/* Comment Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="نظر خود را بنویسید..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            ارسال نظر
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-3 mt-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              در حال بارگذاری...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز نظری ثبت نشده است
            </p>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {comment.user.name || "کاربر ناشناس"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleReportComment(comment.id, "گزارش محتوای نامناسب")
                        }
                      >
                        <Flag className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-500 hover:text-red-600"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">{comment._count.likes}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
