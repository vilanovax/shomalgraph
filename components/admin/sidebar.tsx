"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  MapPin,
  Users,
  MessageSquare,
  FileText,
  Settings,
  List,
  BookOpen,
} from "lucide-react";

const menuItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "رستوران‌ها",
    href: "/admin/restaurants",
    icon: UtensilsCrossed,
  },
  {
    title: "مکان‌های گردشگری",
    href: "/admin/places",
    icon: MapPin,
  },
  {
    title: "کاربران",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "پیشنهادات",
    href: "/admin/suggestions",
    icon: MessageSquare,
  },
  {
    title: "پیشنهاد آیتم (اکسپلور)",
    href: "/admin/explore/suggestions",
    icon: FileText,
  },
  {
    title: "لیست‌ها",
    href: "/admin/lists",
    icon: BookOpen,
  },
  {
    title: "قالب‌های چک‌لیست",
    href: "/admin/checklist-templates",
    icon: List,
  },
  {
    title: "نظرات",
    href: "/admin/reviews",
    icon: FileText,
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-l bg-card">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-green-700">شمال گراف</h2>
        <p className="text-sm text-muted-foreground">پنل مدیریت</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
