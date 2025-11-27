import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Eye, CloudSun, CloudDrizzle, CloudLightning, SunDim } from "lucide-react";

// WMO Weather Code mapping
// https://open-meteo.com/en/docs
export function getWeatherIcon(weatherCode: number) {
  // Clear sky
  if (weatherCode === 0) return Sun;
  
  // Mainly clear
  if (weatherCode === 1) return SunDim;
  
  // Partly cloudy
  if (weatherCode === 2) return CloudSun;
  
  // Overcast
  if (weatherCode === 3) return Cloud;
  
  // Fog and depositing rime fog
  if (weatherCode >= 45 && weatherCode <= 48) return Eye;
  
  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 57) return CloudDrizzle;
  
  // Rain
  if (weatherCode >= 61 && weatherCode <= 67) return CloudRain;
  
  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) return CloudSnow;
  
  // Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) return CloudRain;
  
  // Snow showers
  if (weatherCode >= 85 && weatherCode <= 86) return CloudSnow;
  
  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return CloudLightning;
  
  return Cloud;
}

export function getWeatherLabel(weatherCode: number): string {
  if (weatherCode === 0) return "آفتابی";
  if (weatherCode >= 1 && weatherCode <= 3) return "نیمه ابری";
  if (weatherCode >= 45 && weatherCode <= 48) return "مه";
  if (weatherCode >= 51 && weatherCode <= 57) return "نمنم باران";
  if (weatherCode >= 61 && weatherCode <= 67) return "بارانی";
  if (weatherCode >= 71 && weatherCode <= 77) return "برفی";
  if (weatherCode >= 80 && weatherCode <= 82) return "رگبار";
  if (weatherCode >= 85 && weatherCode <= 86) return "رگبار برف";
  if (weatherCode >= 95 && weatherCode <= 99) return "رعد و برق";
  return "نامشخص";
}

export function getWeatherColor(weatherCode: number): string {
  if (weatherCode === 0) return "from-yellow-400 to-orange-500"; // آفتابی
  if (weatherCode === 1) return "from-yellow-300 to-yellow-400"; // عمدتاً صاف
  if (weatherCode === 2) return "from-blue-300 to-blue-400"; // نیمه ابری
  if (weatherCode === 3) return "from-gray-400 to-gray-500"; // ابری
  if (weatherCode >= 45 && weatherCode <= 48) return "from-gray-500 to-gray-600"; // مه
  if (weatherCode >= 51 && weatherCode <= 57) return "from-blue-400 to-blue-500"; // نمنم باران
  if (weatherCode >= 61 && weatherCode <= 67) return "from-blue-500 to-blue-600"; // بارانی
  if (weatherCode >= 71 && weatherCode <= 77) return "from-blue-200 to-blue-300"; // برفی
  if (weatherCode >= 80 && weatherCode <= 82) return "from-blue-600 to-blue-700"; // رگبار
  if (weatherCode >= 85 && weatherCode <= 86) return "from-blue-100 to-blue-200"; // رگبار برف
  if (weatherCode >= 95 && weatherCode <= 99) return "from-purple-600 to-purple-700"; // رعد و برق
  return "from-gray-400 to-gray-500";
}

