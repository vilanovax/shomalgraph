"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getWeatherIcon,
  getWeatherLabel,
  getWeatherColor,
} from "@/lib/utils/weather-icons";
import { Droplets, Wind, Sun, Eye } from "lucide-react";
import { format } from "date-fns";

interface WeatherDetailProps {
  data: {
    city: {
      id: string;
      name: string;
    };
    current: {
      temperature: number;
      humidity: number;
      weatherCode: number;
      windSpeed: number;
      windDirection: number;
      uvIndex: number;
    };
    hourly: Array<{
      time: string;
      temperature: number;
      weatherCode: number;
      precipitationProbability: number;
    }>;
    daily: Array<{
      date: string;
      weatherCode: number;
      maxTemp: number;
      minTemp: number;
      precipitationProbability: number;
      sunrise: string;
      sunset: string;
    }>;
  };
}

export function WeatherDetail({ data }: WeatherDetailProps) {
  const Icon = getWeatherIcon(data.current.weatherCode);
  const label = getWeatherLabel(data.current.weatherCode);
  const gradient = getWeatherColor(data.current.weatherCode);

  return (
    <div className="space-y-6">
      {/* Current Weather Card - Modern Design */}
      <Card className="border-0 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm">
        <div className={`relative bg-gradient-to-br ${gradient} p-10 text-white overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{data.city.name}</h2>
                <p className="text-white/95 text-lg font-medium">{label}</p>
              </div>
              <div className="p-5 bg-white/25 rounded-3xl backdrop-blur-md shadow-xl border border-white/30">
                <Icon className="h-20 w-20 drop-shadow-lg" />
              </div>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-8xl font-bold drop-shadow-lg">{data.current.temperature}</span>
              <span className="text-4xl opacity-95 font-medium">°C</span>
            </div>
          </div>
        </div>
        <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">رطوبت</p>
                <p className="text-xl font-bold text-gray-900">{data.current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wind className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">باد</p>
                <p className="text-xl font-bold text-gray-900">{data.current.windSpeed} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sun className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">UV Index</p>
                <p className="text-xl font-bold text-gray-900">{data.current.uvIndex}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">احتمال بارش</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.hourly[0]?.precipitationProbability || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 24 Hour Forecast */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-900">پیش‌بینی 24 ساعته</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
              {data.hourly.slice(0, 12).map((hour, index) => {
                const HourIcon = getWeatherIcon(hour.weatherCode);
                const hourGradient = getWeatherColor(hour.weatherCode);
                const time = new Date(hour.time);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-3 min-w-[90px] p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <p className="text-xs font-semibold text-gray-600">
                      {format(time, "HH:mm")}
                    </p>
                    <div className={`p-3 bg-gradient-to-br ${hourGradient} rounded-xl shadow-md`}>
                      <HourIcon className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{hour.temperature}°</p>
                    {hour.precipitationProbability > 0 && (
                      <div className="px-2 py-1 bg-blue-100 rounded-full">
                        <p className="text-xs font-semibold text-blue-700">
                          {hour.precipitationProbability}%
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7 Day Forecast */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-900">پیش‌بینی 7 روزه</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {data.daily.map((day, index) => {
              const DayIcon = getWeatherIcon(day.weatherCode);
              const dayGradient = getWeatherColor(day.weatherCode);
              const date = new Date(day.date);
              const isToday = index === 0;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    isToday
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24">
                      <p className={`text-sm font-bold ${isToday ? "text-blue-700" : "text-gray-900"}`}>
                        {isToday ? "امروز" : format(date, "EEEE")}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(date, "d MMMM")}
                      </p>
                    </div>
                    <div className={`p-2.5 bg-gradient-to-br ${dayGradient} rounded-xl shadow-sm`}>
                      <DayIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">
                        {getWeatherLabel(day.weatherCode)}
                      </p>
                      {day.precipitationProbability > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <p className="text-xs text-blue-600 font-medium">
                            {day.precipitationProbability}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{day.maxTemp}°</p>
                      <p className="text-sm text-gray-500 font-medium">
                        {day.minTemp}°
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


}

