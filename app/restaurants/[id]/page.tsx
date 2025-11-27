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
  Phone,
  Star,
  Heart,
  UtensilsCrossed,
  ExternalLink,
} from "lucide-react";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { CommentsSectionWrapper } from "@/components/comments/CommentsSectionWrapper";
import { MessageCircle } from "lucide-react";

async function getRestaurantDetail(id: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        priceRange: true,
        rating: true,
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
    return restaurant;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    // اگر خطای اتصال به دیتابیس بود، null برمی‌گردانیم
    // صفحه خودش با notFound() یا error UI برخورد می‌کند
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

// Generate metadata for better SEO and performance
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
      },
    });

    if (!restaurant) {
      return {
        title: "رستوران یافت نشد",
      };
    }

    return {
      title: restaurant.name,
      description: restaurant.description || `اطلاعات رستوران ${restaurant.name}`,
    };
  } catch (error) {
    // اگر خطای دیتابیس بود، metadata پیش‌فرض برمی‌گردانیم
    console.error("Error generating metadata:", error);
    return {
      title: "رستوران",
      description: "اطلاعات رستوران",
    };
  }
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await getRestaurantDetail(id);

  if (!restaurant) {
    // اگر رستوران پیدا نشد یا خطای دیتابیس بود
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-lime-500 shadow-xl">
        <div className="relative z-10 px-4 py-6">
          <Link href="/restaurants">
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
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-3">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {restaurant.category && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {restaurant.category.name}
                  </Badge>
                )}
                <Badge
                  className={`${priceRangeColors[restaurant.priceRange]} backdrop-blur-sm`}
                >
                  {priceRangeLabels[restaurant.priceRange]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 -mt-4">
        {/* Bookmark Button */}
        <div className="flex justify-end">
          <BookmarkButton restaurantId={restaurant.id} size="lg" />
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
                    {restaurant.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {restaurant._count.reviews} نظر
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
                    {restaurant._count.favorites}
                  </div>
                  <div className="text-sm text-muted-foreground">ذخیره شده</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {restaurant.description && (
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>درباره رستوران</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {restaurant.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact & Location */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle>آدرس</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="leading-relaxed">{restaurant.address}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                مشاهده در Google Maps
              </a>
            </CardContent>
          </Card>

          {restaurant.phone && (
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>شماره تماس</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
                >
                  <Phone className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                  <span dir="ltr" className="font-mono text-lg font-semibold">
                    {restaurant.phone}
                  </span>
                </a>
              </CardContent>
            </Card>
          )}
        </div>

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
            <CommentsSectionWrapper
              itemType="RESTAURANT"
              restaurantId={restaurant.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
