import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Home } from "lucide-react";

async function getPlaces() {
  try {
    const places = await db.touristPlace.findMany({
      where: { isActive: true },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { rating: "desc" },
    });
    return places;
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
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

const suitableForLabels: Record<string, string> = {
  FAMILY: "خانواده",
  COUPLE: "زوج",
  FRIENDS: "دوستان",
  SOLO: "انفرادی",
  KIDS: "کودکان",
};

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">مکان‌های گردشگری</h1>
              <p className="text-sm text-gray-600">{places.length} مکان</p>
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
        {places.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">مکانی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <Link key={place.id} href={`/places/${place.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg flex-1">{place.name}</CardTitle>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 shrink-0">
                        {placeTypeLabels[place.placeType]}
                      </Badge>
                    </div>
                    {place.category && (
                      <CardDescription>{place.category.name}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {place.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {place.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{place.address}</span>
                    </div>

                    {place.suitableFor.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {place.suitableFor.slice(0, 3).map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {suitableForLabels[type]}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({place._count.reviews})
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        {place.isFree ? "رایگان" : `${place.entryFee?.toLocaleString("fa-IR")} تومان`}
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
