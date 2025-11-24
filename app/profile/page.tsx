import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileHeader } from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Phone, Crown, LogOut, Settings, Heart, MessageSquare, Edit } from "lucide-react";
import Link from "next/link";

async function getUserStats(userId: string) {
  try {
    const [favoritesCount, reviewsCount] = await Promise.all([
      db.favorite.count({
        where: { userId },
      }),
      db.review.count({
        where: { userId },
      }),
    ]);

    return {
      favoritesCount,
      reviewsCount,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      favoritesCount: 0,
      reviewsCount: 0,
    };
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      avatar: true,
      role: true,
    },
  });

  const stats = await getUserStats(session.user.id);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="پروفایل" />

      {/* User Info Card */}
      <section className="px-4 py-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  {user?.avatar && user.avatar.trim() !== "" ? (
                    <AvatarImage src={user.avatar} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {user?.name ? user.name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
                <Link href="/profile/edit">
                  <Button
                    size="sm"
                    className="absolute bottom-0 left-0 rounded-full h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 border-2 border-white shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user?.name || "کاربر گرامی"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Phone className="h-4 w-4" />
                <span>{user?.phone || session.user.phone}</span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  <span>مدیر سیستم</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="px-4 py-2">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.favoritesCount}</p>
              <p className="text-xs text-gray-500">علاقه‌مندی</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.reviewsCount}</p>
              <p className="text-xs text-gray-500">نظرات</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-500">امتیاز</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-4 py-6">
        <div className="space-y-2">
          {isAdmin && (
            <Link href="/admin">
              <Card className="hover:shadow-md transition-shadow border-2 hover:border-purple-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Crown className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">پنل مدیریت</h3>
                      <p className="text-xs text-gray-500">دسترسی به پنل ادمین</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/profile/favorites">
            <Card className="hover:shadow-md transition-shadow border-2 hover:border-pink-300 cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">بوک‌مارک‌ها</h3>
                    <p className="text-xs text-gray-500">مشاهده آیتم‌های ذخیره شده</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/edit">
            <Card className="hover:shadow-md transition-shadow border-2 hover:border-purple-300 cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Edit className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ویرایش پروفایل</h3>
                    <p className="text-xs text-gray-500">ویرایش نام و تصویر پروفایل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <form action={async () => {
            "use server";
            const { signOut } = await import("@/lib/auth");
            await signOut({ redirectTo: "/" });
          }}>
            <Card className="hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-4">
                <button type="submit" className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold text-red-600">خروج از حساب</h3>
                      <p className="text-xs text-gray-500">خروج از حساب کاربری</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
}
