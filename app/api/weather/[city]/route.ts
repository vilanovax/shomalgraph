import { NextResponse } from "next/server";
import { getCityById } from "@/lib/utils/weather-cities";

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
    uv_index: number;
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
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

// GET: دریافت جزئیات آب و هوا برای یک شهر خاص
export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city: cityId } = await params;
    const city = getCityById(cityId);

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: "شهر یافت نشد",
        },
        { status: 404 }
      );
    }

    const url = new URL(OPEN_METEO_URL);
    url.searchParams.append("latitude", city.lat.toString());
    url.searchParams.append("longitude", city.lon.toString());
    url.searchParams.append("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,uv_index");
    url.searchParams.append("hourly", "temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m");
    url.searchParams.append("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset");
    url.searchParams.append("timezone", "Asia/Tehran");
    url.searchParams.append("forecast_days", "7");

    const response = await fetch(url.toString(), {
      next: { revalidate: 600 }, // Cache برای 10 دقیقه
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weather for ${city.name}`);
    }

    const data: WeatherResponse = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        city: {
          id: city.id,
          name: city.name,
          lat: city.lat,
          lon: city.lon,
        },
        current: {
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          weatherCode: data.current.weather_code,
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
          uvIndex: Math.round(data.current.uv_index),
        },
        hourly: data.hourly.time.slice(0, 24).map((time, index) => ({
          time,
          temperature: Math.round(data.hourly.temperature_2m[index]),
          weatherCode: data.hourly.weather_code[index],
          precipitationProbability: data.hourly.precipitation_probability[index],
          humidity: data.hourly.relative_humidity_2m[index],
          windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
        })),
        daily: data.daily.time.map((time, index) => ({
          date: time,
          weatherCode: data.daily.weather_code[index],
          maxTemp: Math.round(data.daily.temperature_2m_max[index]),
          minTemp: Math.round(data.daily.temperature_2m_min[index]),
          precipitationProbability: data.daily.precipitation_probability_max[index],
          sunrise: data.daily.sunrise[index],
          sunset: data.daily.sunset[index],
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching weather details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت اطلاعات آب و هوا",
      },
      { status: 500 }
    );
  }
}

