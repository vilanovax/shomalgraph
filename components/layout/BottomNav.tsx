"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "خانه",
    href: "/",
    icon: Home,
  },
  {
    label: "اکسپلور",
    href: "/explore",
    icon: List,
  },
  {
    label: "ابزار",
    href: "/tools",
    icon: Wrench,
  },
  {
    label: "پروفایل",
    href: "/profile",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on admin pages or auth pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-purple-100")} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
