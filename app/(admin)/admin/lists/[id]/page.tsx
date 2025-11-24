import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Edit,
  Plus,
  MapPin,
  Star,
  UtensilsCrossed,
  Mountain,
  Heart,
  Trash2,
  Hash,
} from "lucide-react";
import { DeleteItemButton } from "./DeleteItemButton";

async function getList(id: string) {
  try {
    const list = await db.list.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
                _count: {
                  select: {
                    reviews: true,
                  },
                },
              },
            },
            place: {
              include: {
                category: true,
                _count: {
                  select: {
                    reviews: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    return list;
  } catch (error) {
    console.error("Error fetching list:", error);
    return null;
  }
}

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

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getList(id);

  if (!list) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-700 to-rose-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <Link href="/admin/lists">
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
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{list.title}</h1>
                {list.description && (
                  <p className="text-purple-100 mb-2">{list.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {list.type === "PUBLIC" ? "عمومی" : "شخصی"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-white/80">
                    <Heart className="h-4 w-4" />
                    <span>{list._count.likes}</span>
                  </div>
                </div>
                {list.keywords && list.keywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    {list.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm gap-1"
                      >
                        <Hash className="h-3 w-3" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/lists/${list.id}/add-items`}>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                >
                  <Plus className="ml-2 h-5 w-5" />
                  افزودن آیتم
                </Button>
              </Link>
              <Link href={`/admin/lists/${list.id}/edit`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Edit className="ml-2 h-5 w-5" />
                  ویرایش
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Items List */}
      {list.items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-purple-50 rounded-full mb-6">
              <MapPin className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">این لیست هنوز آیتمی ندارد</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              با کلیک روی دکمه افزودن آیتم، رستوران‌ها و مکان‌های گردشگری را به این لیست اضافه کنید
            </p>
            <Link href={`/admin/lists/${list.id}/add-items`}>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                افزودن اولین آیتم
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              آیتم‌های لیست ({list.items.length})
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.items.map((item, index) => {
              const entity = item.restaurant || item.place;
              const isRestaurant = !!item.restaurant;

              if (!entity) return null;

              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-lg transition-all border-2"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {isRestaurant ? (
                            <UtensilsCrossed className="h-4 w-4 text-blue-600 shrink-0" />
                          ) : (
                            <Mountain className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                          <Badge
                            variant="outline"
                            className={
                              isRestaurant
                                ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                : "bg-green-50 text-green-700 border-green-200 text-xs"
                            }
                          >
                            {isRestaurant ? "رستوران" : "مکان گردشگری"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold mb-1 line-clamp-1">
                          {entity.name}
                        </CardTitle>
                        {entity.category && (
                          <p className="text-sm text-muted-foreground">
                            {entity.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{entity.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {entity.rating.toFixed(1)}
                        </span>
                        {isRestaurant && item.restaurant && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {priceRangeLabels[item.restaurant.priceRange]}
                          </Badge>
                        )}
                        {!isRestaurant && item.place && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              item.place.isFree
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {item.place.isFree
                              ? "رایگان"
                              : `${item.place.entryFee?.toLocaleString()} تومان`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.note && (
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium mb-1">یادداشت:</p>
                        <p className="text-muted-foreground">{item.note}</p>
                      </div>
                    )}
                    <DeleteItemButton listId={list.id} itemId={item.id} />
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

