export interface WeatherCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const NORTHERN_CITIES: WeatherCity[] = [
  { id: "nowshahr", name: "نوشهر", lat: 36.65, lon: 51.50 },
  { id: "chalus", name: "چالوس", lat: 36.65, lon: 51.42 },
  { id: "ramsar", name: "رامسر", lat: 36.90, lon: 50.65 },
  { id: "sari", name: "ساری", lat: 36.56, lon: 53.06 },
  { id: "amol", name: "آمل", lat: 36.47, lon: 52.35 },
  { id: "rasht", name: "رشت", lat: 37.28, lon: 49.58 },
  { id: "anzali", name: "انزلی", lat: 37.47, lon: 49.46 },
];

export function getCityById(id: string): WeatherCity | undefined {
  return NORTHERN_CITIES.find((city) => city.id === id);
}

