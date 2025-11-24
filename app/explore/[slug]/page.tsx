import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Heart, Bookmark } from "lucide-react";
import { ListDetailClient } from "@/components/explore/ListDetailClient";
import { SuggestItemButton } from "@/components/explore/SuggestItemButton";

async function getListDetails(slug: string) {
  try {
    const list = await db.list.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: { name: true },
        },
        items: {
          include: {
            restaurant: {
              include: {
                category: true,
              },
            },
            place: {
              include: {
                category: true,
              },
            },
            _count: {
              select: {
                likes: true,
                dislikes: true,
                comments: true,
              },
            },
          },
          orderBy: { order: "asc" },
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
    console.error("Error fetching list details:", error);
    return null;
  }
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const list = await getListDetails(slug);

  if (!list) {
    notFound();
  }

  // Get restaurants and places for suggestion
  const [restaurants, places] = await Promise.all([
    db.restaurant.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      take: 50,
    }),
    db.touristPlace.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      take: 50,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/explore">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-purple-700">
                  {list.title}
                </h1>
                {list.createdBy?.name && (
                  <p className="text-sm text-gray-600">
                    توسط {list.createdBy.name}
                  </p>
                )}
              </div>
            </div>
            <Link href="/auth/signin">
              <Button variant="outline">ورود / ثبت نام</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* List Info Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{list.title}</CardTitle>
                  {list.description && (
                    <CardDescription className="text-base">
                      {list.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{list._count.likes} لایک</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  <span>{list.items.length} آیتم</span>
                </div>
              </div>
              <div>
                <SuggestItemButton
                  listId={list.id}
                  restaurants={restaurants}
                  places={places}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* List Items */}
      <section className="py-4 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <ListDetailClient items={list.items} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">شمال گراف</h3>
          <p className="text-gray-400">دستیار سفر هوشمند برای شمال ایران</p>
          <p className="text-gray-500 text-sm mt-4">
            © 2024 تمامی حقوق محفوظ است
          </p>
        </div>
      </footer>
    </div>
  );
}
