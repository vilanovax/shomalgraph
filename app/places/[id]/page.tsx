import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  MapPin,
  Star,
  Heart,
  Mountain,
  ExternalLink,
  Users,
  MessageCircle,
} from "lucide-react";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { CommentsSectionWrapper } from "@/components/comments/CommentsSectionWrapper";

async function getPlaceDetail(id: string) {
  try {
    const place = await db.touristPlace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        placeType: true,
        suitableFor: true,
        rating: true,
        isFree: true,
        entryFee: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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

// Generate metadata for better SEO and performance
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const place = await db.touristPlace.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
      },
    });

    if (!place) {
      return {
        title: "مکان یافت نشد",
      };
    }

    return {
      title: place.name,
      description: place.description || `اطلاعات مکان ${place.name}`,
    };
  } catch (error) {
    // اگر خطای دیتابیس بود، metadata پیش‌فرض برمی‌گردانیم
    console.error("Error generating metadata:", error);
    return {
      title: "مکان گردشگری",
      description: "اطلاعات مکان گردشگری",
    };
  }
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceDetail(id);

  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-500 shadow-xl">
        <div className="relative z-10 px-4 py-6">
          <Link href="/places">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
              بازگشت
            </Button>
          </Link>
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-3">
                {place.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`${placeTypeColors[place.placeType]} backdrop-blur-sm`}
                >
                  {placeTypeLabels[place.placeType]}
                </Badge>
                {place.category && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {place.category.name}
                  </Badge>
                )}
                {place.isFree ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 backdrop-blur-sm">
                    رایگان
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 backdrop-blur-sm">
                    {place.entryFee?.toLocaleString()} تومان
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 -mt-4">
        {/* Bookmark Button */}
        <div className="flex justify-end">
          <BookmarkButton placeId={place.id} size="lg" />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {place.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {place._count.reviews} نظر
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {place._count.favorites}
                  </div>
                  <div className="text-sm text-muted-foreground">ذخیره شده</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suitable For */}
        {place.suitableFor.length > 0 && (
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>مناسب برای</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {place.description && (
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mountain className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>درباره مکان</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {place.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Location */}
        <Card className="border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>آدرس و موقعیت</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="leading-relaxed">{place.address}</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              مشاهده در Google Maps
            </a>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>کامنت‌ها</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CommentsSectionWrapper itemType="PLACE" placeId={place.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

