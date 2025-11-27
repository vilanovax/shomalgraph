import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Star, UtensilsCrossed, Search, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SeedRestaurantsButton } from "./SeedRestaurantsButton";

async function getRestaurants() {
  try {
    // بهینه‌سازی: استفاده از select به جای include و محدود کردن به 50 رستوران
    const restaurants = await db.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        rating: true,
        priceRange: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewCount: true, // استفاده از فیلد موجود به جای _count
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // کاهش از 100 به 50
    });
    
    return restaurants;
  } catch (error) {
    console.error("❌ خطا در دریافت رستوران‌ها:", error);
    return [];
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

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">رستوران‌ها</h1>
                <p className="text-blue-100 text-sm mt-1">
                  مدیریت رستوران‌ها و کافه‌های ثبت شده
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <SeedRestaurantsButton />
              <Link href="/admin/restaurants/new">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="ml-2 h-5 w-5" />
                  افزودن رستوران
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Search Bar */}
      <Card className="border-2 border-blue-100">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="جستجوی رستوران..."
              className="pr-10 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      {restaurants.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-blue-50 rounded-full mb-6">
              <UtensilsCrossed className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">هنوز رستورانی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              با کلیک روی دکمه زیر اولین رستوران را اضافه کنید یا رستوران‌های نمونه را اضافه کنید
            </p>
            <div className="flex gap-3">
              <SeedRestaurantsButton />
              <Link href="/admin/restaurants/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  افزودن رستوران اول
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/admin/restaurants/${restaurant.id}`}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {restaurant.name}
                      </CardTitle>
                      {restaurant.category && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <span className="text-xs">{restaurant.category.name}</span>
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      className={`shrink-0 ${
                        restaurant.isActive
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {restaurant.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${priceRangeColors[restaurant.priceRange]}`}
                    >
                      {priceRangeLabels[restaurant.priceRange]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
