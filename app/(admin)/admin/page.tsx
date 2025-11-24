import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  MapPin,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Eye,
  Sparkles,
  List,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardStats() {
  try {
    const [
      restaurantsCount,
      placesCount,
      usersCount,
      pendingSuggestionsCount,
      pendingItemSuggestionsCount,
      recentReviews,
      listsCount,
    ] = await Promise.all([
      db.restaurant.count(),
      db.touristPlace.count(),
      db.user.count(),
      db.suggestion.count({ where: { status: "pending" } }),
      db.itemSuggestion.count({ where: { status: "pending" } }),
      db.review.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.list.count(),
    ]);

    return {
      restaurantsCount,
      placesCount,
      usersCount,
      pendingSuggestionsCount,
      pendingItemSuggestionsCount,
      recentReviews,
      listsCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      restaurantsCount: 0,
      placesCount: 0,
      usersCount: 0,
      pendingSuggestionsCount: 0,
      pendingItemSuggestionsCount: 0,
      recentReviews: 0,
      listsCount: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "رستوران‌ها",
      value: stats.restaurantsCount,
      icon: UtensilsCrossed,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      href: "/admin/restaurants",
    },
    {
      title: "مکان‌های گردشگری",
      value: stats.placesCount,
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      href: "/admin/places",
    },
    {
      title: "کاربران",
      value: stats.usersCount,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      href: "/admin/users",
    },
    {
      title: "پیشنهادات در انتظار",
      value: stats.pendingSuggestionsCount,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      href: "/admin/suggestions",
      badge: stats.pendingSuggestionsCount > 0 ? "new" : undefined,
    },
    {
      title: "پیشنهاد آیتم (اکسپلور)",
      value: stats.pendingItemSuggestionsCount,
      icon: Sparkles,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      href: "/admin/explore/suggestions",
      badge: stats.pendingItemSuggestionsCount > 0 ? "new" : undefined,
    },
    {
      title: "لیست‌ها",
      value: stats.listsCount,
      icon: List,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      href: "/admin/lists",
    },
    {
      title: "نظرات هفته اخیر",
      value: stats.recentReviews,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "رشد این ماه",
      value: "+12%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">داشبورد مدیریت</h1>
              <p className="text-purple-100 text-sm mt-1">
                خلاصه وضعیت سیستم و آمار کلی
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const StatCard = (
            <Card
              className={`group hover:shadow-lg transition-all duration-300 border-2 ${stat.borderColor} hover:border-purple-300 cursor-pointer h-full`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  {stat.badge && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      جدید
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.title} href={stat.href}>
              {StatCard}
            </Link>
          ) : (
            <div key={stat.title}>{StatCard}</div>
          );
        })}
      </div>

      {/* Activity & Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>فعالیت‌های اخیر</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    هنوز فعالیتی ثبت نشده است
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>آمار بازدید</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    آمار بازدید در حال آماده‌سازی است
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
