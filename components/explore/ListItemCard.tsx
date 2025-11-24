"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MapPin,
  Star,
  Bookmark,
} from "lucide-react";
import { Prisma } from "@prisma/client";

type ListItemWithRelations = Prisma.ListItemGetPayload<{
  include: {
    restaurant: {
      include: {
        category: true;
      };
    };
    place: {
      include: {
        category: true;
      };
    };
    _count: {
      select: {
        likes: true;
        dislikes: true;
        comments: true;
      };
    };
  };
}>;

interface ListItemCardProps {
  item: ListItemWithRelations;
  index: number;
  onCommentClick: (itemId: string) => void;
}

export function ListItemCard({ item, index, onCommentClick }: ListItemCardProps) {
  const [likes, setLikes] = useState(item._count.likes);
  const [dislikes, setDislikes] = useState(item._count.dislikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const content = item.restaurant || item.place;
  if (!content) return null;

  const isRestaurant = !!item.restaurant;

  const handleLike = async () => {
    try {
      const res = await fetch("/api/explore/items/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          setLikes(likes + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes(dislikes - 1);
            setIsDisliked(false);
          }
        } else {
          setLikes(likes - 1);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error("Error liking item:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await fetch("/api/explore/items/dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.disliked) {
          setDislikes(dislikes + 1);
          setIsDisliked(true);
          if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
          }
        } else {
          setDislikes(dislikes - 1);
          setIsDisliked(false);
        }
      }
    } catch (error) {
      console.error("Error disliking item:", error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-purple-700">
              {index + 1}
            </span>
          </div>
          <div className="flex-1">
            <Link
              href={
                isRestaurant
                  ? `/restaurants/${content.id}`
                  : `/places/${content.id}`
              }
            >
              <CardTitle className="text-xl hover:text-purple-700 transition-colors">
                {content.name}
              </CardTitle>
            </Link>
            {isRestaurant && item.restaurant?.category && (
              <CardDescription>
                {item.restaurant.category.name}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location & Rating */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{content.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {content.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Note from admin */}
        {item.note && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{item.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${
              isLiked
                ? "text-green-600 bg-green-50"
                : "text-green-600 hover:text-green-700 hover:bg-green-50"
            }`}
            onClick={handleLike}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${
              isDisliked
                ? "text-red-600 bg-red-50"
                : "text-red-600 hover:text-red-700 hover:bg-red-50"
            }`}
            onClick={handleDislike}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
            <span>{dislikes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onCommentClick(item.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{item._count.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 mr-auto ${
              isBookmarked
                ? "text-purple-600 bg-purple-50"
                : "hover:bg-purple-50"
            }`}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span>ذخیره</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
