import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Home } from "lucide-react";

async function getRestaurants() {
  try {
    const restaurants = await db.restaurant.findMany({
      where: { isActive: true },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { rating: "desc" },
    });
    return restaurants;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">رستوران‌ها و کافه‌ها</h1>
              <p className="text-sm text-gray-600">{restaurants.length} رستوران</p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                خانه
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {restaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">رستورانی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    {restaurant.category && (
                      <CardDescription>{restaurant.category.name}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {restaurant.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {restaurant.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{restaurant.address}</span>
                    </div>
                    {restaurant.phone && (
                      <div className="text-sm text-muted-foreground" dir="ltr">
                        📞 {restaurant.phone}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({restaurant._count.reviews} نظر)
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        {restaurant.priceRange === "BUDGET" && "$ ارزان"}
                        {restaurant.priceRange === "MODERATE" && "$$ متوسط"}
                        {restaurant.priceRange === "EXPENSIVE" && "$$$ گران"}
                        {restaurant.priceRange === "LUXURY" && "$$$$ لاکچری"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
