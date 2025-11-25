"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PlanTypeSelectorProps {
  className?: string;
}

export function PlanTypeSelector({ className }: PlanTypeSelectorProps) {
  const planTypes = [
    {
      id: "quick",
      title: "برنامه فوری",
      subtitle: "الان چیکار کنم؟",
      icon: Zap,
      href: "/explore/plan/quick",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      description: "پیشنهاد سریع برای الان",
    },
    {
      id: "daily",
      title: "برنامه روزانه",
      subtitle: "امروز چه برنامه‌ای داشته باشم؟",
      icon: Calendar,
      href: "/explore/plan/daily",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      description: "برنامه کامل یک روز",
    },
    {
      id: "trip",
      title: "برنامه کلی سفر",
      subtitle: "۳ روز در رامسر",
      icon: MapPin,
      href: "/explore/plan/trip",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      description: "برنامه چندروزه کامل",
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {planTypes.map((planType) => {
        const Icon = planType.icon;
        return (
          <Link key={planType.id} href={planType.href}>
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br mb-4 p-6 text-white">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-3">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black mb-1">{planType.title}</h3>
                    <p className="text-white/90 text-sm">{planType.subtitle}</p>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${planType.gradient} opacity-90`}></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {planType.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

