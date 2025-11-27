"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getWeatherIcon, getWeatherLabel, getWeatherColor } from "@/lib/utils/weather-icons";
import { ArrowLeft } from "lucide-react";

interface WeatherCardProps {
  city: {
    id: string;
    name: string;
  };
  current: {
    temperature: number;
    weatherCode: number;
  };
  today?: {
    maxTemp: number;
    minTemp: number;
  };
}

export function WeatherCard({ city, current, today }: WeatherCardProps) {
  const Icon = getWeatherIcon(current.weatherCode);
  const label = getWeatherLabel(current.weatherCode);
  const gradient = getWeatherColor(current.weatherCode);

  return (
    <Link href={`/tools/weather/${city.id}`}>
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer h-full hover:scale-[1.02] hover:-translate-y-1">
        {/* Background gradient effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {city.name}
              </h3>
              <p className="text-sm text-gray-600 font-medium">{label}</p>
            </div>
            <div className={`p-5 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300 border-2 border-white/30`}>
              <Icon className="h-12 w-12 text-white drop-shadow-lg stroke-[2.5]" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {current.temperature}
                </span>
                <span className="text-2xl text-gray-500 font-medium">°C</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
              </div>
            </div>
            
            {/* دمای روز و شب */}
            {today && (
              <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">روز</span>
                  <span className="text-lg font-bold text-gray-900">{today.maxTemp}°</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">شب</span>
                  <span className="text-lg font-bold text-gray-700">{today.minTemp}°</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </Card>
    </Link>
  );
}

