import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SuggestionActions } from "@/components/explore/SuggestionActions";
import {
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";

async function getSuggestions() {
  try {
    const suggestions = await db.itemSuggestion.findMany({
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch restaurants and places separately
    const restaurantIds = suggestions
      .filter((s) => s.restaurantId)
      .map((s) => s.restaurantId!)
      .filter(Boolean);
    const placeIds = suggestions
      .filter((s) => s.placeId)
      .map((s) => s.placeId!)
      .filter(Boolean);

    const [restaurants, places] = await Promise.all([
      restaurantIds.length > 0
        ? db.restaurant.findMany({
            where: { id: { in: restaurantIds } },
            select: { id: true, name: true },
          })
        : [],
      placeIds.length > 0
        ? db.touristPlace.findMany({
            where: { id: { in: placeIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));
    const placeMap = new Map(places.map((p) => [p.id, p]));

    return suggestions.map((s) => ({
      ...s,
      restaurant: s.restaurantId ? restaurantMap.get(s.restaurantId) : null,
      place: s.placeId ? placeMap.get(s.placeId) : null,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

export default async function ItemSuggestionsPage() {
  const suggestions = await getSuggestions();

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const reviewedSuggestions = suggestions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-pink-700 to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">پیشنهادات آیتم‌ها</h1>
              <p className="text-pink-100 text-sm mt-1">
                مدیریت پیشنهادات کاربران برای اضافه کردن آیتم‌ها به لیست‌ها
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Pending Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold">
              در انتظار بررسی ({pendingSuggestions.length})
            </h2>
          </div>
        </div>
        {pendingSuggestions.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="p-4 bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
              <p className="text-muted-foreground font-medium">
                هیچ پیشنهاد جدیدی وجود ندارد
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingSuggestions.map((suggestion) => {
              const item = suggestion.restaurant || suggestion.place;
              const itemType = suggestion.restaurant
                ? "رستوران"
                : "مکان گردشگری";
              const Icon = suggestion.restaurant ? UtensilsCrossed : MapPin;

              return (
                <Card
                  key={suggestion.id}
                  className="hover:shadow-lg transition-all border-2 border-orange-100 hover:border-orange-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <Icon className="h-5 w-5 text-orange-600" />
                          </div>
                          <CardTitle className="text-xl font-bold">
                            {item?.name || "آیتم حذف شده"}
                          </CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {itemType}
                          </Badge>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>
                              {suggestion.user.name || suggestion.user.phone}
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(suggestion.createdAt).toLocaleDateString(
                                "fa-IR"
                              )}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        <Clock className="h-3 w-3 ml-1" />
                        در انتظار
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestion.note && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            توضیحات:
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {suggestion.note}
                        </p>
                      </div>
                    )}
                    <SuggestionActions suggestionId={suggestion.id} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed Suggestions */}
      {reviewedSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold">
              بررسی شده ({reviewedSuggestions.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {reviewedSuggestions.map((suggestion) => {
              const item = suggestion.restaurant || suggestion.place;
              const itemType = suggestion.restaurant
                ? "رستوران"
                : "مکان گردشگری";
              const Icon = suggestion.restaurant ? UtensilsCrossed : MapPin;

              return (
                <Card
                  key={suggestion.id}
                  className="opacity-75 hover:opacity-100 transition-opacity border-2"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <CardTitle className="text-xl font-bold">
                            {item?.name || "آیتم حذف شده"}
                          </CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {itemType}
                          </Badge>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>
                              {suggestion.user.name || suggestion.user.phone}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          suggestion.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          suggestion.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {suggestion.status === "approved" ? (
                          <>
                            <CheckCircle className="h-3 w-3 ml-1" />
                            تایید شده
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 ml-1" />
                            رد شده
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestion.adminNote && (
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-r-4 border-green-500">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-900">
                            پاسخ ادمین:
                          </span>
                        </div>
                        <p className="text-sm text-green-800 leading-relaxed">
                          {suggestion.adminNote}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
