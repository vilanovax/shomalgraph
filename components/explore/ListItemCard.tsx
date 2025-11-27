"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  UtensilsCrossed,
  Mountain,
  ArrowUpRight,
  Sparkles,
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
    <Card className="group relative overflow-hidden border-2 border-purple-100/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 opacity-90" />
      <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

      <CardHeader className="relative">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-bold text-white shadow-lg">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm ring-1 ring-purple-100">
                {isRestaurant ? (
                  <UtensilsCrossed className="h-4 w-4" />
                ) : (
                  <Mountain className="h-4 w-4" />
                )}
                {isRestaurant ? "رستوران / کافه" : "مکان گردشگری"}
              </span>
              {isRestaurant && item.restaurant?.category && (
                <Badge variant="outline" className="bg-white/80 text-xs text-purple-700">
                  {item.restaurant.category.name}
                </Badge>
              )}
              {!isRestaurant && item.place?.category && (
                <Badge variant="outline" className="bg-white/80 text-xs text-emerald-700">
                  {item.place.category.name}
                </Badge>
              )}
            </div>

            <Link
              href={
                isRestaurant
                  ? `/restaurants/${content.id}`
                  : `/places/${content.id}`
              }
            >
              <CardTitle className="text-2xl font-black leading-tight text-gray-900 transition-colors hover:text-purple-700">
                {content.name}
              </CardTitle>
            </Link>
            {content.description && (
              <CardDescription className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                {content.description}
              </CardDescription>
            )}
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-purple-600 shadow-inner ring-1 ring-purple-100">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm ring-1 ring-gray-100">
            <MapPin className="h-4 w-4 text-purple-500" />
            <span className="line-clamp-1">{content.address}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-100">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
            <span>{content.rating.toFixed(1)}</span>
          </div>
          {isRestaurant && item.restaurant?.priceRange && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              {item.restaurant.priceRange === "BUDGET" && "اقتصادی"}
              {item.restaurant.priceRange === "MODERATE" && "متوسط"}
              {item.restaurant.priceRange === "EXPENSIVE" && "گران"}
              {item.restaurant.priceRange === "LUXURY" && "لاکچری"}
            </Badge>
          )}
          {!isRestaurant && item.place && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              {item.place.isFree
                ? "رایگان"
                : `${item.place.entryFee?.toLocaleString("fa-IR")} تومان`}
            </Badge>
          )}
        </div>

        {/* Note from admin */}
        {item.note && (
          <div className="rounded-2xl border border-purple-100 bg-white/80 p-4 shadow-inner">
            <p className="text-xs font-semibold text-purple-700 mb-1">
              یادداشت انتخاب شده برای این آیتم
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{item.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid gap-3 border-t border-dashed border-purple-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="secondary"
            size="sm"
            className={`justify-start gap-2 rounded-xl bg-white text-green-700 shadow-sm ring-1 ring-green-100 transition ${
              isLiked ? "bg-green-50 ring-green-200" : "hover:bg-green-50"
            }`}
            onClick={handleLike}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-semibold">{likes} پسند</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className={`justify-start gap-2 rounded-xl bg-white text-red-700 shadow-sm ring-1 ring-red-100 transition ${
              isDisliked ? "bg-red-50 ring-red-200" : "hover:bg-red-50"
            }`}
            onClick={handleDislike}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
            <span className="text-sm font-semibold">{dislikes} مخالف</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="justify-start gap-2 rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50"
            onClick={() => onCommentClick(item.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">{item._count.comments} کامنت</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className={`flex-1 justify-start gap-2 rounded-xl bg-white text-purple-700 shadow-sm ring-1 ring-purple-100 transition ${
                isBookmarked ? "bg-purple-50 ring-purple-200" : "hover:bg-purple-50"
              }`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="text-sm font-semibold">ذخیره</span>
            </Button>
            <Link
              href={
                isRestaurant
                  ? `/restaurants/${content.id}`
                  : `/places/${content.id}`
              }
              className="shrink-0"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-purple-700 hover:bg-purple-50"
                aria-label="مشاهده جزئیات"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
