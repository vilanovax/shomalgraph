"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Star,
  UtensilsCrossed,
  Mountain,
  Navigation,
} from "lucide-react";
import type { TimeSlot } from "@prisma/client";

interface PlanItemCardProps {
  item: {
    id: string;
    order: number;
    dayNumber?: number | null;
    timeSlot?: TimeSlot | null;
    scheduledTime?: Date | null;
    duration?: number | null;
    travelDuration?: number | null;
    distance?: number | null;
    notes?: string | null;
    tips?: string | null;
    isCompleted?: boolean;
    restaurant?: {
      id: string;
      name: string;
      slug: string;
      address: string;
      rating: number;
      priceRange: string;
      _count: {
        reviews: number;
      };
    } | null;
    place?: {
      id: string;
      name: string;
      slug: string;
      address: string;
      rating: number;
      placeType: string;
      entryFee?: number | null;
      isFree: boolean;
      _count: {
        reviews: number;
      };
    } | null;
  };
}

const timeSlotLabels: Record<string, string> = {
  MORNING: "صبح",
  NOON: "ظهر",
  AFTERNOON: "بعدازظهر",
  EVENING: "عصر",
  NIGHT: "شب",
};

const priceRangeLabels: Record<string, string> = {
  BUDGET: "اقتصادی",
  MODERATE: "متوسط",
  EXPENSIVE: "گران",
  LUXURY: "لاکچری",
};

export function PlanItemCard({ item }: PlanItemCardProps) {
  const target = item.restaurant || item.place;
  const isRestaurant = !!item.restaurant;

  if (!target) return null;

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order Badge */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {item.order}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isRestaurant ? (
                    <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Mountain className="h-4 w-4 text-green-500" />
                  )}
                  <h4 className="font-semibold">{target.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {target.address}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {target.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({target._count.reviews})
                </span>
              </div>
            </div>

            {/* Time Info */}
            {(item.scheduledTime || item.timeSlot) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {item.scheduledTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(item.scheduledTime)}</span>
                  </div>
                )}
                {item.timeSlot && (
                  <Badge variant="outline" className="text-xs">
                    {timeSlotLabels[item.timeSlot]}
                  </Badge>
                )}
                {item.duration && (
                  <span className="text-xs">
                    {Math.round(item.duration / 60)} ساعت
                  </span>
                )}
              </div>
            )}

            {/* Travel Info */}
            {item.travelDuration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Navigation className="h-3 w-3" />
                <span>
                  {item.travelDuration} دقیقه سفر
                  {item.distance && ` (${item.distance.toFixed(1)} کیلومتر)`}
                </span>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex items-center gap-2 flex-wrap">
              {isRestaurant && item.restaurant && (
                <Badge variant="secondary" className="text-xs">
                  {priceRangeLabels[item.restaurant.priceRange]}
                </Badge>
              )}
              {!isRestaurant && item.place && (
                <>
                  {item.place.isFree ? (
                    <Badge variant="secondary" className="text-xs">
                      رایگان
                    </Badge>
                  ) : (
                    item.place.entryFee && (
                      <Badge variant="secondary" className="text-xs">
                        {item.place.entryFee.toLocaleString("fa-IR")} تومان
                      </Badge>
                    )
                  )}
                </>
              )}
            </div>

            {/* Notes/Tips */}
            {(item.notes || item.tips) && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {item.notes || item.tips}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={
                  isRestaurant
                    ? `/restaurants/${item.restaurant!.slug}`
                    : `/places/${item.place!.slug}`
                }
              >
                <Button variant="outline" size="sm">
                  جزئیات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

