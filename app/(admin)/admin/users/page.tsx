import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users as UsersIcon,
  Shield,
  Briefcase,
  User,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getUsers() {
  try {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            reviews: true,
            favorites: true,
            suggestions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const businessOwnerCount = users.filter(
    (u) => u.role === "BUSINESS_OWNER"
  ).length;
  const regularUserCount = users.filter((u) => u.role === "USER").length;

  const roleStats = [
    {
      title: "مدیران",
      value: adminCount,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "صاحبان کسب‌وکار",
      value: businessOwnerCount,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "کاربران عادی",
      value: regularUserCount,
      icon: UsersIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">کاربران</h1>
              <p className="text-purple-100 text-sm mt-1">
                مدیریت و مشاهده لیست کاربران سیستم
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {roleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`border-2 ${stat.borderColor} hover:shadow-lg transition-all`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-purple-50 rounded-full mb-6">
              <UsersIcon className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">هنوز کاربری ثبت نشده</h3>
            <p className="text-muted-foreground text-center max-w-md">
              کاربران در اینجا نمایش داده می‌شوند
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-all border-2 hover:border-purple-200"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-purple-100">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                      {user.name ? user.name[0] : user.phone[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-lg font-bold">
                        {user.name || "بدون نام"}
                      </CardTitle>
                      {user.role === "ADMIN" && (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-700 border-red-200"
                        >
                          <Shield className="h-3 w-3 ml-1" />
                          مدیر
                        </Badge>
                      )}
                      {user.role === "BUSINESS_OWNER" && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Briefcase className="h-3 w-3 ml-1" />
                          صاحب کسب‌وکار
                        </Badge>
                      )}
                      {user.role === "USER" && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <User className="h-3 w-3 ml-1" />
                          کاربر عادی
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>{user.phone}</span>
                      <span>•</span>
                      <span>عضویت: {formatDate(user.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="font-bold text-2xl text-gray-900">
                      {user._count.reviews}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">نظر</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="font-bold text-2xl text-gray-900">
                      {user._count.favorites}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ذخیره شده
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="font-bold text-2xl text-gray-900">
                      {user._count.suggestions}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">پیشنهاد</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
