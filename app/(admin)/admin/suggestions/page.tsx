import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getSuggestions() {
  try {
    const suggestions = await db.suggestion.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    return suggestions;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

export default async function SuggestionsPage() {
  const suggestions = await getSuggestions();

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const approvedSuggestions = suggestions.filter(
    (s) => s.status === "approved"
  );
  const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected");

  const stats = [
    {
      title: "در انتظار بررسی",
      value: pendingSuggestions.length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "تایید شده",
      value: approvedSuggestions.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "رد شده",
      value: rejectedSuggestions.length,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">پیشنهادات کاربران</h1>
              <p className="text-orange-100 text-sm mt-1">
                بررسی و تایید پیشنهادات ارسال شده توسط کاربران
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
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

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-orange-50 rounded-full mb-6">
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">هنوز پیشنهادی ثبت نشده</h3>
            <p className="text-muted-foreground text-center max-w-md">
              پیشنهادات کاربران در اینجا نمایش داده می‌شود
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className="hover:shadow-lg transition-all border-2 hover:border-orange-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg font-bold">
                        {suggestion.type === "restaurant"
                          ? "رستوران"
                          : "مکان گردشگری"}
                      </CardTitle>
                      {suggestion.status === "pending" && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          <Clock className="h-3 w-3 ml-1" />
                          در انتظار
                        </Badge>
                      )}
                      {suggestion.status === "approved" && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          تایید شده
                        </Badge>
                      )}
                      {suggestion.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 ml-1" />
                          رد شده
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>
                          {suggestion.user.name || suggestion.user.phone}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(suggestion.createdAt)}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestion.comment && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">توضیحات:</span>
                    </div>
                    <p className="text-sm leading-relaxed">{suggestion.comment}</p>
                  </div>
                )}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      اطلاعات پیشنهادی:
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto text-blue-800">
                    {JSON.stringify(suggestion.data, null, 2)}
                  </pre>
                </div>
                {suggestion.adminComment && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-r-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">
                        نظر ادمین:
                      </span>
                    </div>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {suggestion.adminComment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
