"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, MapPin, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fa } from "date-fns/locale";

interface TravelPlanCardProps {
  plan: {
    id: string;
    planType: string;
    title?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    address: string;
    status: string;
    totalDuration?: number | null;
    totalDistance?: number | null;
    estimatedCost?: number | null;
    _count?: {
      items: number;
    };
    items?: Array<unknown>;
  };
}

const planTypeLabels: Record<string, string> = {
  QUICK: "فوری",
  DAILY: "روزانه",
  TRIP: "چندروزه",
};

const statusLabels: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  ACTIVE: "فعال",
  COMPLETED: "تکمیل شده",
};

export function TravelPlanCard({ plan }: TravelPlanCardProps) {
  const itemsCount = plan._count?.items || plan.items?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{planTypeLabels[plan.planType]}</Badge>
              <Badge
                variant={
                  plan.status === "ACTIVE"
                    ? "default"
                    : plan.status === "COMPLETED"
                    ? "outline"
                    : "secondary"
                }
              >
                {statusLabels[plan.status]}
              </Badge>
            </div>
            {plan.title && (
              <h3 className="text-lg font-semibold mb-1">{plan.title}</h3>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {plan.address}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plan.startDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(plan.startDate), "d MMMM yyyy", { locale: fa })}
                {plan.endDate &&
                  ` - ${format(new Date(plan.endDate), "d MMMM yyyy", { locale: fa })}`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-sm">
            {plan.totalDuration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{Math.round(plan.totalDuration / 60)} ساعت</span>
              </div>
            )}
            {plan.totalDistance && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{plan.totalDistance.toFixed(1)} کیلومتر</span>
              </div>
            )}
            {plan.estimatedCost && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>
                  {plan.estimatedCost.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {itemsCount} آیتم
          </div>

          <Link href={`/explore/plan/${plan.id}`}>
            <Button className="w-full" variant="outline">
              مشاهده برنامه
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

