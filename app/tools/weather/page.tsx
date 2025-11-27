import { MobileHeader } from "@/components/layout/MobileHeader";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud } from "lucide-react";
import { NORTHERN_CITIES } from "@/lib/utils/weather-cities";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

interface WeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

async function getWeatherData() {
  try {
    const weatherPromises = NORTHERN_CITIES.map(async (city) => {
      const url = new URL(OPEN_METEO_URL);
      url.searchParams.append("latitude", city.lat.toString());
      url.searchParams.append("longitude", city.lon.toString());
      url.searchParams.append("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m");
      url.searchParams.append("hourly", "temperature_2m,weather_code,precipitation_probability");
      url.searchParams.append("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
      url.searchParams.append("timezone", "Asia/Tehran");
      url.searchParams.append("forecast_days", "7");

      const response = await fetch(url.toString(), {
        next: { revalidate: 600 }, // Cache برای 10 دقیقه
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather for ${city.name}`);
      }

      const data: WeatherResponse = await response.json();

      return {
        city: {
          id: city.id,
          name: city.name,
        },
        current: {
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          weatherCode: data.current.weather_code,
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
        },
        today: {
          maxTemp: Math.round(data.daily.temperature_2m_max[0]),
          minTemp: Math.round(data.daily.temperature_2m_min[0]),
        },
      };
    });

    const results = await Promise.all(weatherPromises);
    return results;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
}

export default async function WeatherPage() {
  const weatherData = await getWeatherData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <MobileHeader title="آب و هوای شمال" />

      <div className="px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-8 text-white shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-lg">
                    <Cloud className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      آب و هوای شمال
                    </h1>
                    <p className="text-blue-100 text-sm">
                      وضعیت آب و هوای شهرهای مهم شمال ایران
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
            </div>
          </div>

          {/* Weather Cards */}
          {weatherData.length === 0 ? (
            <Card className="border-2 border-dashed border-cyan-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-6 animate-pulse">
                  <Cloud className="h-16 w-16 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  در حال دریافت اطلاعات...
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  لطفاً چند لحظه صبر کنید
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {weatherData.map((item: any) => (
                <WeatherCard
                  key={item.city.id}
                  city={item.city}
                  current={item.current}
                  today={item.today}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

