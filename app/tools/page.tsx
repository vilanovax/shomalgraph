import { MobileHeader } from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Cloud,
  Calculator,
  Phone,
  MessageSquare,
  Camera,
  Map
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    id: "map",
    title: "نقشه",
    description: "مشاهده نقشه تعاملی",
    icon: Map,
    color: "from-blue-500 to-blue-600",
    href: "/map",
  },
  {
    id: "nearby",
    title: "اطراف من",
    description: "مکان‌های نزدیک",
    icon: MapPin,
    color: "from-green-500 to-green-600",
    href: "/nearby",
  },
  {
    id: "directions",
    title: "مسیریابی",
    description: "پیدا کردن مسیر",
    icon: Navigation,
    color: "from-purple-500 to-purple-600",
    href: "/directions",
  },
  {
    id: "weather",
    title: "آب و هوا",
    description: "وضعیت آب و هوا",
    icon: Cloud,
    color: "from-cyan-500 to-cyan-600",
    href: "/tools/weather",
  },
  {
    id: "calculator",
    title: "محاسبه هزینه",
    description: "برآورد هزینه سفر",
    icon: Calculator,
    color: "from-orange-500 to-orange-600",
    href: "/calculator",
  },
  {
    id: "emergency",
    title: "اورژانس",
    description: "شماره‌های ضروری",
    icon: Phone,
    color: "from-red-500 to-red-600",
    href: "/emergency",
  },
  {
    id: "chat",
    title: "چت پشتیبانی",
    description: "ارتباط با پشتیبانی",
    icon: MessageSquare,
    color: "from-indigo-500 to-indigo-600",
    href: "/support",
  },
  {
    id: "camera",
    title: "شناسایی مکان",
    description: "شناسایی با دوربین",
    icon: Camera,
    color: "from-pink-500 to-pink-600",
    href: "/camera",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="ابزار" />

      <section className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            ابزار کمکی
          </h2>
          <p className="text-sm text-gray-500">
            ابزارهای مفید برای سفر بهتر
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          دسترسی سریع
        </h3>
        <div className="space-y-2">
          <Link href="/restaurants">
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  رستوران‌های نزدیک
                </span>
                <span className="text-xs text-purple-600">مشاهده</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/places">
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  مکان‌های گردشگری
                </span>
                <span className="text-xs text-purple-600">مشاهده</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
