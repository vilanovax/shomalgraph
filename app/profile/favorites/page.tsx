import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { FavoritesClient } from "./FavoritesClient";

async function getFavorites(userId: string) {
  try {
    const favorites = await db.favorite.findMany({
      where: {
        userId,
      },
      include: {
        restaurant: {
          include: {
            category: true,
            _count: {
              select: {
                reviews: true,
                favorites: true,
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
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return favorites;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}


export default async function FavoritesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const favorites = await getFavorites(session.user.id);

  return (
    <div className="min-h-screen bg-muted/10">
      <MobileHeader title="بوک‌مارک‌ها" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-500 p-6 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">بوک‌مارک‌های من</h1>
                <p className="text-white/80 text-sm mt-1">
                  {favorites.length} آیتم ذخیره شده
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        </div>

        {/* Favorites List/Grid */}
        <FavoritesClient favorites={favorites} />
      </div>
    </div>
  );
}

