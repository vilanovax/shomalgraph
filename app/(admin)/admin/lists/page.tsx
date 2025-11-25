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
import { Plus, List, Search, Heart, MapPin, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SeedListsButton } from "./SeedListsButton";

async function getLists() {
  try {
    const lists = await db.list.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return lists;
  } catch (error) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

export default async function ListsPage() {
  const lists = await getLists();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-700 to-rose-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <List className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">لیست‌ها</h1>
                <p className="text-purple-100 text-sm mt-1">
                  مدیریت لیست‌های اکسپلور و گردشگری
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SeedListsButton />
              <Link href="/admin/lists/new">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="ml-2 h-5 w-5" />
                  ایجاد لیست جدید
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Search Bar */}
      <Card className="border-2 border-purple-100">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="جستجوی لیست..."
              className="pr-10 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      {lists.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-purple-50 rounded-full mb-6">
              <List className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">هنوز لیستی ایجاد نشده</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              با کلیک روی دکمه زیر اولین لیست را ایجاد کنید
            </p>
            <Link href="/admin/lists/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                ایجاد لیست اول
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link key={list.id} href={`/admin/lists/${list.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {list.title}
                      </CardTitle>
                      {list.description && (
                        <CardDescription className="line-clamp-2 mt-2">
                          {list.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className="shrink-0 bg-purple-100 text-purple-700 border-purple-300">
                      {list.type === "PUBLIC" ? "عمومی" : "شخصی"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold text-gray-900">
                        {list._count.items}
                      </span>
                      <span>آیتم</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
                      <span className="font-semibold text-gray-900">
                        {list._count.likes}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <p>ایجاد شده توسط: {list.createdBy.name || list.createdBy.phone}</p>
                    <p className="mt-1">
                      {new Date(list.createdAt).toLocaleDateString("fa-IR")}
                    </p>
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

