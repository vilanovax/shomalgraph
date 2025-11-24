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
  Star,
  ExternalLink,
  Mountain,
  Calendar,
  Users,
  Heart,
} from "lucide-react";

async function getPlace(id: string) {
  try {
    const place = await db.touristPlace.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });
    return place;
  } catch (error) {
    console.error("Error fetching place:", error);
    return null;
  }
}

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

const placeTypeColors: Record<string, string> = {
  NATURE: "bg-green-100 text-green-700 border-green-200",
  HISTORICAL: "bg-amber-100 text-amber-700 border-amber-200",
  ENTERTAINMENT: "bg-pink-100 text-pink-700 border-pink-200",
  CULTURAL: "bg-purple-100 text-purple-700 border-purple-200",
  BEACH: "bg-cyan-100 text-cyan-700 border-cyan-200",
  MOUNTAIN: "bg-gray-100 text-gray-700 border-gray-200",
  FOREST: "bg-emerald-100 text-emerald-700 border-emerald-200",
  WATERFALL: "bg-blue-100 text-blue-700 border-blue-200",
  PARK: "bg-lime-100 text-lime-700 border-lime-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};

const suitableForLabels: Record<string, string> = {
  FAMILY: "خانواده",
  COUPLE: "زوج",
  FRIENDS: "دوستان",
  SOLO: "انفرادی",
  KIDS: "کودکان",
};

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <Link href="/admin/places">
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
                <Mountain className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {placeTypeLabels[place.placeType]}
                  </Badge>
                  {place.category && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {place.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Link href={`/admin/places/${place.id}/edit`}>
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 shadow-lg"
              >
                <Edit className="ml-2 h-5 w-5" />
                ویرایش
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* اطلاعات اصلی */}
        <Card className="border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mountain className="h-5 w-5 text-green-600" />
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
                {place.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    فعال
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    غیرفعال
                  </Badge>
                )}
                {place.isVerified && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    تایید شده
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                نوع دسترسی
              </div>
              {place.isFree ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  رایگان
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  {place.entryFee
                    ? `${place.entryFee.toLocaleString()} تومان`
                    : "هزینه ورودی"}
                </Badge>
              )}
            </div>

            {place.suitableFor.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  مناسب برای
                </div>
                <div className="flex flex-wrap gap-2">
                  {place.suitableFor.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {suitableForLabels[type]}
                    </Badge>
                  ))}
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
                    {place.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    از {place._count.reviews} نظر
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
                <span className="font-semibold">{place._count.favorites}</span>
                <span className="text-sm text-muted-foreground">کاربر</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* آدرس و موقعیت */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
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
                <span className="leading-relaxed">{place.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  عرض جغرافیایی
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm text-center">
                  {place.latitude}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  طول جغرافیایی
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm text-center">
                  {place.longitude}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
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
      {place.description && (
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
              {place.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

