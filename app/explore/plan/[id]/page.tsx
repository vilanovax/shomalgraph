import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlanItemCard } from "@/components/travel/PlanItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Clock, DollarSign, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fa } from "date-fns/locale";
import { PlanActions } from "@/components/travel/PlanActions";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PlanPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const plan = await db.travelPlan.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          restaurant: {
            include: {
              category: true,
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                },
              },
            },
          },
          place: {
            include: {
              category: true,
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                },
              },
            },
          },
        },
        orderBy: [
          { dayNumber: "asc" },
          { order: "asc" },
        ],
      },
    },
  });

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">برنامه یافت نشد</h1>
          <Link href="/explore/my-plans">
            <Button>برنامه‌های من</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (plan.userId !== session.user.id && !plan.isShared) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">دسترسی غیرمجاز</h1>
          <Link href="/explore/my-plans">
            <Button>برنامه‌های من</Button>
          </Link>
        </div>
      </div>
    );
  }

  // گروه‌بندی آیتم‌ها بر اساس روز (برای Trip Plan)
  const itemsByDay = new Map<number, typeof plan.items>();
  if (plan.planType === "TRIP") {
    for (const item of plan.items) {
      const day = item.dayNumber || 1;
      if (!itemsByDay.has(day)) {
        itemsByDay.set(day, []);
      }
      itemsByDay.get(day)!.push(item);
    }
  }

  const planTypeLabels: Record<string, string> = {
    QUICK: "برنامه فوری",
    DAILY: "برنامه روزانه",
    TRIP: "برنامه چندروزه",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/explore/my-plans">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
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
                  {plan.status === "ACTIVE"
                    ? "فعال"
                    : plan.status === "COMPLETED"
                    ? "تکمیل شده"
                    : "پیش‌نویس"}
                </Badge>
              </div>
              {plan.title && (
                <h1 className="text-3xl font-black mb-2">{plan.title}</h1>
              )}
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {plan.address}
              </p>
            </div>
            {plan.userId === session.user.id && (
              <PlanActions planId={plan.id} />
            )}
          </div>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>خلاصه برنامه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {plan.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاریخ</p>
                    <p className="font-semibold">
                      {format(new Date(plan.startDate), "d MMMM yyyy", {
                        locale: fa,
                      })}
                    </p>
                  </div>
                </div>
              )}
              {plan.totalDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">مدت</p>
                    <p className="font-semibold">
                      {Math.round(plan.totalDuration / 60)} ساعت
                    </p>
                  </div>
                </div>
              )}
              {plan.totalDistance && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">مسافت</p>
                    <p className="font-semibold">
                      {plan.totalDistance.toFixed(1)} کیلومتر
                    </p>
                  </div>
                </div>
              )}
              {plan.estimatedCost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">هزینه</p>
                    <p className="font-semibold">
                      {plan.estimatedCost.toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        {plan.planType === "TRIP" && itemsByDay.size > 0 ? (
          <div className="space-y-6">
            {Array.from(itemsByDay.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, items]) => (
                <div key={day}>
                  <h2 className="text-xl font-bold mb-4">روز {day}</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <PlanItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {plan.items.map((item) => (
              <PlanItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

