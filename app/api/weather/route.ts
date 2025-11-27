import { NextResponse } from "next/server";
import { NORTHERN_CITIES } from "@/lib/utils/weather-cities";

// Open-Meteo API endpoint
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
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
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

// GET: دریافت آب و هوای همه شهرها
export async function GET() {
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
        hourly: data.hourly.time.slice(0, 24).map((time, index) => ({
          time,
          temperature: Math.round(data.hourly.temperature_2m[index]),
          weatherCode: data.hourly.weather_code[index],
          precipitationProbability: data.hourly.precipitation_probability[index],
        })),
        daily: data.daily.time.map((time, index) => ({
          date: time,
          weatherCode: data.daily.weather_code[index],
          maxTemp: Math.round(data.daily.temperature_2m_max[index]),
          minTemp: Math.round(data.daily.temperature_2m_min[index]),
          precipitationProbability: data.daily.precipitation_probability_max[index],
        })),
      };
    });

    const results = await Promise.all(weatherPromises);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت اطلاعات آب و هوا",
      },
      { status: 500 }
    );
  }
}

