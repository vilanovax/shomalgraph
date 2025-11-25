"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import {
  Heart,
  UtensilsCrossed,
  Mountain,
  MapPin,
  Star,
  ArrowLeft,
  Grid3x3,
  List,
} from "lucide-react";
import Link from "next/link";

interface FavoriteItem {
  id: string;
  restaurantId: string | null;
  placeId: string | null;
  restaurant: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    rating: number;
    priceRange: string;
    category: {
      name: string;
    } | null;
    _count: {
      reviews: number;
      favorites: number;
    };
  } | null;
  place: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    rating: number;
    placeType: string;
    category: {
      name: string;
    } | null;
    _count: {
      reviews: number;
      favorites: number;
    };
  } | null;
}

interface FavoritesClientProps {
  favorites: FavoriteItem[];
}

const priceRangeLabels: Record<string, string> = {
  BUDGET: "ارزان",
  MODERATE: "متوسط",
  EXPENSIVE: "گران",
  LUXURY: "لاکچری",
};

const placeTypeLabels: Record<string, string> = {
  NATURE: "طبیعت",
  HISTORICAL: "تاریخی",
  ENTERTAINMENT: "تفریحی",
  CULTURAL: "فرهنگی",
  BEACH: "ساحل",
  MOUNTAIN: "کوهستان",
  FOREST: "جنگل",
  WATERFALL: "آبشار",
  PARK: "پارک",
  OTHER: "سایر",
};

export function FavoritesClient({ favorites }: FavoritesClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // بارگذاری تنظیمات از localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("favoritesViewMode") as "grid" | "list" | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // ذخیره تنظیمات در localStorage
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("favoritesViewMode", mode);
  };

  if (favorites.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground font-medium mb-2">
            هنوز بوک‌مارکی اضافه نکرده‌اید
          </p>
          <p className="text-center text-sm text-muted-foreground">
            برای ذخیره آیتم‌ها، به صفحه جزئیات آنها بروید و روی دکمه &quot;ذخیره&quot; کلیک کنید
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => handleViewModeChange("list")}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          لیست
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleViewModeChange("grid")}
          className="gap-2"
        >
          <Grid3x3 className="h-4 w-4" />
          گرید
        </Button>
      </div>

      {/* Items */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((favorite) => {
            const item = favorite.restaurant || favorite.place;
            const isRestaurant = !!favorite.restaurant;

            if (!item) return null;

            return (
              <Card
                key={favorite.id}
                className="border-2 hover:shadow-lg transition-all h-full flex flex-col"
              >
                <CardContent className="p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isRestaurant ? "bg-emerald-100" : "bg-teal-100"
                      }`}
                    >
                      {isRestaurant ? (
                        <UtensilsCrossed
                          className={`h-5 w-5 ${
                            isRestaurant ? "text-emerald-600" : "text-teal-600"
                          }`}
                        />
                      ) : (
                        <Mountain
                          className={`h-5 w-5 ${
                            isRestaurant ? "text-emerald-600" : "text-teal-600"
                          }`}
                        />
                      )}
                    </div>
                    <BookmarkButton
                      restaurantId={favorite.restaurantId || undefined}
                      placeId={favorite.placeId || undefined}
                      size="sm"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category.name}
                      </Badge>
                    )}
                    {isRestaurant && favorite.restaurant && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 text-xs"
                      >
                        {priceRangeLabels[favorite.restaurant.priceRange]}
                      </Badge>
                    )}
                    {!isRestaurant && favorite.place && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        {placeTypeLabels[favorite.place.placeType]}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {item.description}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="mr-1">({item._count.reviews} نظر)</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">{item.address}</span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={
                      isRestaurant
                        ? `/restaurants/${favorite.restaurantId}`
                        : `/places/${favorite.placeId}`
                    }
                    className="mt-auto"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      مشاهده جزئیات
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => {
            const item = favorite.restaurant || favorite.place;
            const isRestaurant = !!favorite.restaurant;

            if (!item) return null;

            return (
              <Card
                key={favorite.id}
                className="border-2 hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isRestaurant ? "bg-emerald-100" : "bg-teal-100"
                      }`}
                    >
                      {isRestaurant ? (
                        <UtensilsCrossed
                          className={`h-6 w-6 ${
                            isRestaurant
                              ? "text-emerald-600"
                              : "text-teal-600"
                          }`}
                        />
                      ) : (
                        <Mountain
                          className={`h-6 w-6 ${
                            isRestaurant
                              ? "text-emerald-600"
                              : "text-teal-600"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.category && (
                              <Badge variant="outline">
                                {item.category.name}
                              </Badge>
                            )}
                            {isRestaurant && favorite.restaurant && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700"
                              >
                                {priceRangeLabels[favorite.restaurant.priceRange]}
                              </Badge>
                            )}
                            {!isRestaurant && favorite.place && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {placeTypeLabels[favorite.place.placeType]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <BookmarkButton
                          restaurantId={favorite.restaurantId || undefined}
                          placeId={favorite.placeId || undefined}
                          size="sm"
                        />
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating.toFixed(1)}</span>
                          <span className="mr-1">
                            ({item._count.reviews} نظر)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{item.address}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={
                            isRestaurant
                              ? `/restaurants/${favorite.restaurantId}`
                              : `/places/${favorite.placeId}`
                          }
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            مشاهده جزئیات
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

