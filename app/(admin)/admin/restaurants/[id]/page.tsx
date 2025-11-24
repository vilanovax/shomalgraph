import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Edit,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  UtensilsCrossed,
  Calendar,
  Users,
  Heart,
} from "lucide-react";

async function getRestaurant(id: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });
    return restaurant;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
}

const priceRangeLabels: Record<string, string> = {
  BUDGET: "ارزان",
  MODERATE: "متوسط",
  EXPENSIVE: "گران",
  LUXURY: "لاکچری",
};

const priceRangeColors: Record<string, string> = {
  BUDGET: "bg-green-100 text-green-700 border-green-200",
  MODERATE: "bg-blue-100 text-blue-700 border-blue-200",
  EXPENSIVE: "bg-orange-100 text-orange-700 border-orange-200",
  LUXURY: "bg-purple-100 text-purple-700 border-purple-200",
};

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <Link href="/admin/restaurants">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
              بازگشت
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                {restaurant.category && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {restaurant.category.name}
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              >
                <Edit className="ml-2 h-5 w-5" />
                ویرایش
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* اطلاعات اصلی */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>اطلاعات اصلی</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                وضعیت
              </div>
              <div className="flex gap-2 flex-wrap">
                {restaurant.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    فعال
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    غیرفعال
                  </Badge>
                )}
                {restaurant.isVerified && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    تایید شده
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                محدوده قیمت
              </div>
              <Badge
                variant="outline"
                className={priceRangeColors[restaurant.priceRange]}
              >
                {priceRangeLabels[restaurant.priceRange]}
              </Badge>
            </div>

            {restaurant.phone && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  شماره تماس
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr" className="font-mono">
                    {restaurant.phone}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                امتیاز
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {restaurant.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    از {restaurant._count.reviews} نظر
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                ذخیره‌ها
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                <Heart className="h-4 w-4 text-pink-600" />
                <span className="font-semibold">{restaurant._count.favorites}</span>
                <span className="text-sm text-muted-foreground">کاربر</span>
              </div>
            </div>

            {restaurant.owner && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  صاحب
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {restaurant.owner.name || restaurant.owner.phone}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* آدرس و موقعیت */}
        <Card className="border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>موقعیت</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                آدرس
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <span className="leading-relaxed">{restaurant.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  عرض جغرافیایی
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm text-center">
                  {restaurant.latitude}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  طول جغرافیایی
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm text-center">
                  {restaurant.longitude}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                مشاهده در Google Maps
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* توضیحات */}
      {restaurant.description && (
        <Card className="border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>توضیحات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
