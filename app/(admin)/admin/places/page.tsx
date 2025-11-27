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
import { Plus, MapPin, Star, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SeedPlacesButton } from "./SeedPlacesButton";

async function getPlaces() {
  try {
    // بهینه‌سازی: استفاده از select به جای include
    const places = await db.touristPlace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        placeType: true,
        suitableFor: true,
        rating: true,
        isFree: true,
        entryFee: true,
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
      take: 50,
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

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">مکان‌های گردشگری</h1>
                <p className="text-green-100 text-sm mt-1">
                  مدیریت مکان‌های گردشگری و جاذبه‌های توریستی
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <SeedPlacesButton />
              <Link href="/admin/places/new">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="ml-2 h-5 w-5" />
                  افزودن مکان
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Search Bar */}
      <Card className="border-2 border-green-100">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="جستجوی مکان گردشگری..."
              className="pr-10 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      {places.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-green-50 rounded-full mb-6">
              <MapPin className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">هنوز مکانی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              با کلیک روی دکمه زیر اولین مکان گردشگری را اضافه کنید
            </p>
            <Link href="/admin/places/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                افزودن مکان اول
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Link key={place.id} href={`/admin/places/${place.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                        {place.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${placeTypeColors[place.placeType]}`}
                        >
                          {placeTypeLabels[place.placeType]}
                        </Badge>
                        {place.category && (
                          <CardDescription className="text-xs">
                            {place.category.name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 ${
                        place.isActive
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {place.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{place.address}</span>
                  </div>

                  {place.suitableFor.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {place.suitableFor.map((type) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {suitableForLabels[type]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {place.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({place.reviewCount})
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        place.isFree
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}
                    >
                      {place.isFree
                        ? "رایگان"
                        : `${place.entryFee?.toLocaleString()} تومان`}
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
