import Link from "next/link";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { List, Heart, Sparkles, MapPin } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";

async function getPublicLists() {
  try {
    const lists = await db.list.findMany({
      where: { type: "PUBLIC" },
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: {
            items: true,
            likes: true
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return lists;
  } catch (error) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

export default async function ExplorePage() {
  const lists = await getPublicLists();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="اکسپلور" />

      {/* Banners */}
      <section className="px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-1">کشف مکان‌های جدید</h3>
                  <p className="text-white/90 text-sm">
                    بهترین رستوران‌ها و مکان‌های گردشگری شمال را پیدا کنید
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-1">سفر به شمال ایران</h3>
                  <p className="text-white/90 text-sm">
                    تجربه‌های منحصر به فرد در استان‌های شمالی کشور
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Lists Grid */}
      <section className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {lists.length === 0 ? (
            <div className="text-center py-12">
              <List className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                هنوز لیستی وجود ندارد
              </h3>
              <p className="text-gray-500">
                به زودی لیست‌های جذاب اضافه خواهند شد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lists.map((list) => (
                <Link key={list.id} href={`/explore/${list.slug}`}>
                  <Card className="hover:shadow-md transition-shadow border-2 hover:border-purple-300">
                    <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg" />
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {list.title}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {list.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <List className="h-4 w-4" />
                            <span>{list._count.items} آیتم</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{list._count.likes}</span>
                          </div>
                        </div>
                        {list.createdBy?.name && (
                          <span className="text-xs">
                            {list.createdBy.name}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
