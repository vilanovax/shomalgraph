import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Star, ChevronLeft, UtensilsCrossed, Compass } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";

async function getHomeData() {
  try {
    const [topRestaurants, topPlaces] = await Promise.all([
      db.restaurant.findMany({
        where: { isActive: true },
        include: {
          category: true,
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { rating: "desc" },
        take: 6,
      }),
      db.touristPlace.findMany({
        where: { isActive: true },
        include: {
          category: true,
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { rating: "desc" },
        take: 6,
      }),
    ]);

    return { topRestaurants, topPlaces };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { topRestaurants: [], topPlaces: [] };
  }
}

export default async function Home() {
  const { topRestaurants, topPlaces } = await getHomeData();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="شمال گراف" showNotifications showSearch />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            سفر به شمال ایران
          </h2>
          <p className="text-purple-100 mb-6">
            بهترین رستوران‌ها و مکان‌های گردشگری
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/restaurants">
              <Button size="lg" className="w-full gap-2 bg-white text-purple-700 hover:bg-purple-50">
                <UtensilsCrossed className="h-5 w-5" />
                رستوران‌ها
              </Button>
            </Link>
            <Link href="/places">
              <Button size="lg" variant="outline" className="w-full gap-2 border-white text-white hover:bg-purple-700">
                <Compass className="h-5 w-5" />
                مکان‌ها
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Restaurants */}
      <section className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                رستوران‌های برتر
              </h3>
              <p className="text-sm text-gray-500">محبوب‌ترین‌ها</p>
            </div>
            <Link href="/restaurants">
              <Button variant="ghost" size="sm" className="gap-1 text-purple-600">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {topRestaurants.slice(0, 3).map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {restaurant.name}
                        </h4>
                        {restaurant.category && (
                          <p className="text-xs text-gray-500 mb-2">
                            {restaurant.category.name}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="font-medium">
                              {restaurant.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-400">
                            {restaurant.priceRange === "BUDGET" && "ارزان"}
                            {restaurant.priceRange === "MODERATE" && "متوسط"}
                            {restaurant.priceRange === "EXPENSIVE" && "گران"}
                            {restaurant.priceRange === "LUXURY" && "لاکچری"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Places */}
      <section className="px-4 py-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                مکان‌های گردشگری
              </h3>
              <p className="text-sm text-gray-500">محبوب‌ترین جاذبه‌ها</p>
            </div>
            <Link href="/places">
              <Button variant="ghost" size="sm" className="gap-1 text-purple-600">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {topPlaces.slice(0, 4).map((place) => (
              <Link key={place.id} href={`/places/${place.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg" />
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                      {place.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-green-600 font-medium">
                        {place.isFree ? "رایگان" : `${(place.entryFee! / 1000).toFixed(0)}هت`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
