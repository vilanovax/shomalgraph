"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Search,
  Loader2,
  Plus,
  MapPin,
  Star,
  UtensilsCrossed,
  Mountain,
  Filter,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRICE_RANGE_OPTIONS = [
  { value: "BUDGET", label: "ارزان" },
  { value: "MODERATE", label: "متوسط" },
  { value: "EXPENSIVE", label: "گران" },
  { value: "LUXURY", label: "لاکچری" },
] as const;

const PLACE_TYPE_OPTIONS = [
  { value: "NATURE", label: "طبیعت" },
  { value: "HISTORICAL", label: "تاریخی" },
  { value: "ENTERTAINMENT", label: "تفریحی" },
  { value: "CULTURAL", label: "فرهنگی" },
  { value: "BEACH", label: "ساحل" },
  { value: "MOUNTAIN", label: "کوهستان" },
  { value: "FOREST", label: "جنگل" },
  { value: "WATERFALL", label: "آبشار" },
  { value: "PARK", label: "پارک" },
  { value: "OTHER", label: "سایر" },
] as const;

const priceRangeLabels: Record<string, string> = {
  BUDGET: "ارزان",
  MODERATE: "متوسط",
  EXPENSIVE: "گران",
  LUXURY: "لاکچری",
};

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

type Restaurant = {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceRange: string;
  category: { name: string } | null;
  _count: { reviews: number };
};

type Place = {
  id: string;
  name: string;
  address: string;
  rating: number;
  placeType: string;
  isFree: boolean;
  entryFee: number | null;
  category: { name: string } | null;
  _count: { reviews: number };
};

type ListItem = {
  id: string;
  restaurantId: string | null;
  placeId: string | null;
  restaurant: Restaurant | null;
  place: Place | null;
};

export default function AddItemsPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "restaurant" | "place">("all");
  const [priceRange, setPriceRange] = useState<string>("");
  const [placeType, setPlaceType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (type) params.append("type", type);
      if (priceRange) params.append("priceRange", priceRange);
      if (placeType) params.append("placeType", placeType);

      const response = await fetch(
        `/api/admin/lists/items/search?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data.restaurants || []);
        setPlaces(data.data.places || []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, type, priceRange, placeType]);

  // دریافت آیتم‌های موجود در لیست
  const fetchListItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/lists/${listId}/items`);
      const data = await response.json();

      if (data.success) {
        setListItems(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching list items:", error);
    }
  }, [listId]);

  useEffect(() => {
    fetchItems();
    fetchListItems();
  }, [fetchItems, fetchListItems]);

  const handleAddItem = async (
    restaurantId: string | null,
    placeId: string | null
  ) => {
    const itemId = restaurantId || placeId;
    if (!itemId) return;

    setIsAdding(itemId);
    try {
      const response = await fetch(`/api/admin/lists/${listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurantId || null,
          placeId: placeId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // نمایش پیام خطا به صورت user-friendly
        const errorMessage = data.error || "خطا در اضافه کردن آیتم";
        alert(errorMessage);
        return;
      }

      // به‌روزرسانی لیست آیتم‌ها و نتایج جستجو
      await fetchListItems();
      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      const response = await fetch(
        `/api/admin/lists/${listId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "خطا در حذف آیتم";
        alert(errorMessage);
        return;
      }

      // به‌روزرسانی لیست آیتم‌ها و نتایج جستجو
      await fetchListItems();
      await fetchItems();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsRemoving(null);
    }
  };

  // بررسی اینکه آیا آیتم در لیست است
  const isItemInList = (restaurantId: string | null, placeId: string | null) => {
    return listItems.some(
      (item) =>
        (restaurantId && item.restaurantId === restaurantId) ||
        (placeId && item.placeId === placeId)
    );
  };

  // پیدا کردن آیتم لیست بر اساس restaurantId یا placeId
  const findListItem = (restaurantId: string | null, placeId: string | null) => {
    return listItems.find(
      (item) =>
        (restaurantId && item.restaurantId === restaurantId) ||
        (placeId && item.placeId === placeId)
    );
  };

  const clearFilters = () => {
    setSearch("");
    setType("all");
    setPriceRange("");
    setPlaceType("");
  };

  const hasActiveFilters =
    search || type !== "all" || priceRange || placeType;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-l from-purple-600 via-pink-600 to-rose-500 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">پنل مدیریت · افزودن آیتم</p>
            <h1 className="mt-1 text-3xl font-black">افزودن آیتم به لیست</h1>
            <p className="text-white/80">
              رستوران‌ها و مکان‌های گردشگری را جستجو و فیلتر کنید و به لیست اضافه کنید.
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="gap-2 bg-white/20 text-white hover:bg-white/30"
          >
            <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
            بازگشت
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <CardTitle>فیلتر و جستجو</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>جستجو</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="نام، آدرس..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>نوع</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="restaurant">رستوران</SelectItem>
                  <SelectItem value="place">مکان گردشگری</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "all" || type === "restaurant" ? (
              <div className="space-y-2">
                <Label>محدوده قیمت (رستوران)</Label>
                <Select
                  value={priceRange || "all"}
                  onValueChange={(v) => setPriceRange(v === "all" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    {PRICE_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {type === "all" || type === "place" ? (
              <div className="space-y-2">
                <Label>نوع مکان</Label>
                <Select
                  value={placeType || "all"}
                  onValueChange={(v) => setPlaceType(v === "all" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    {PLACE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Added Items Section */}
      {listItems.length > 0 && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle>آیتم‌های اضافه شده به لیست ({listItems.length})</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {listItems.map((item) => {
                const entity = item.restaurant || item.place;
                const isRestaurant = !!item.restaurant;

                if (!entity) return null;

                return (
                  <Card
                    key={item.id}
                    className="border-green-200 bg-white"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isRestaurant ? (
                              <UtensilsCrossed className="h-4 w-4 text-blue-600 shrink-0" />
                            ) : (
                              <Mountain className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                            <p className="font-semibold text-sm line-clamp-1">
                              {entity.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {entity.address}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving === item.id}
                          className="shrink-0"
                        >
                          {isRemoving === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Restaurants */}
          {(type === "all" || type === "restaurant") && restaurants.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-blue-600" />
                رستوران‌ها ({restaurants.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold mb-1 line-clamp-1">
                            {restaurant.name}
                          </CardTitle>
                          {restaurant.category && (
                            <CardDescription>
                              {restaurant.category.name}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {priceRangeLabels[restaurant.priceRange]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-2">{restaurant.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">
                            ({restaurant._count.reviews})
                          </span>
                        </div>
                      </div>
                      {isItemInList(restaurant.id, null) ? (
                        <Button
                          onClick={() => {
                            const item = findListItem(restaurant.id, null);
                            if (item) handleRemoveItem(item.id);
                          }}
                          disabled={isRemoving === findListItem(restaurant.id, null)?.id}
                          variant="destructive"
                          className="w-full gap-2"
                          size="sm"
                        >
                          {isRemoving === findListItem(restaurant.id, null)?.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          حذف از لیست
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAddItem(restaurant.id, null)}
                          disabled={isAdding === restaurant.id}
                          className="w-full gap-2"
                          size="sm"
                        >
                          {isAdding === restaurant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          افزودن به لیست
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Places */}
          {(type === "all" || type === "place") && places.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mountain className="h-6 w-6 text-green-600" />
                مکان‌های گردشگری ({places.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <Card key={place.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold mb-1 line-clamp-1">
                            {place.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200"
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
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-2">{place.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{place.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">
                            ({place._count.reviews})
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
                      {isItemInList(null, place.id) ? (
                        <Button
                          onClick={() => {
                            const item = findListItem(null, place.id);
                            if (item) handleRemoveItem(item.id);
                          }}
                          disabled={isRemoving === findListItem(null, place.id)?.id}
                          variant="destructive"
                          className="w-full gap-2"
                          size="sm"
                        >
                          {isRemoving === findListItem(null, place.id)?.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          حذف از لیست
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAddItem(null, place.id)}
                          disabled={isAdding === place.id}
                          className="w-full gap-2"
                          size="sm"
                        >
                          {isAdding === place.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          افزودن به لیست
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            restaurants.length === 0 &&
            places.length === 0 && (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">نتیجه‌ای یافت نشد</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    فیلترها را تغییر دهید یا عبارت جستجوی دیگری امتحان کنید
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}

