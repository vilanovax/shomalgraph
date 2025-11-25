"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
  onError?: (error: string) => void;
}

// شهرهای شمال ایران با مختصات تقریبی
const CITIES = [
  { name: "رامسر", lat: 36.917, lng: 50.658 },
  { name: "چالوس", lat: 36.655, lng: 51.420 },
  { name: "نوشهر", lat: 36.648, lng: 51.496 },
  { name: "نور", lat: 36.573, lng: 52.015 },
  { name: "آمل", lat: 36.469, lng: 52.350 },
  { name: "بابل", lat: 36.544, lng: 52.678 },
  { name: "ساری", lat: 36.563, lng: 53.060 },
  { name: "گرگان", lat: 36.842, lng: 54.443 },
  { name: "رشت", lat: 37.280, lng: 49.588 },
  { name: "انزلی", lat: 37.473, lng: 49.458 },
  { name: "لاهیجان", lat: 37.207, lng: 50.004 },
  { name: "فومن", lat: 37.224, lng: 49.312 },
];

export function LocationPicker({
  value,
  onChange,
  onError,
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualMode, setManualMode] = useState<"city" | "coordinates">("city");
  const [selectedCity, setSelectedCity] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
  });

  // دریافت موقعیت از GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError?.("مرورگر شما از GPS پشتیبانی نمی‌کند");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // تلاش برای دریافت آدرس از API (یا استفاده از مختصات)
          const address = await getAddressFromCoordinates(lat, lng);

          onChange({
            latitude: lat,
            longitude: lng,
            address,
          });
          onError?.("");
        } catch (error) {
          const address = `موقعیت فعلی (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
          onChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address,
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        onError?.("خطا در دریافت موقعیت GPS");
        setIsLoading(false);
      }
    );
  };

  // دریافت آدرس از مختصات (استفاده از API نقشه یا fallback)
  const getAddressFromCoordinates = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      // می‌توانید از API نقشه استفاده کنید
      // برای حالا از مختصات استفاده می‌کنیم
      return `موقعیت فعلی (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    } catch {
      return `موقعیت فعلی (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  };

  // انتخاب شهر
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    const city = CITIES.find((c) => c.name === cityName);
    if (city) {
      onChange({
        latitude: city.lat,
        longitude: city.lng,
        address: city.name,
      });
      onError?.("");
    }
  };

  // ورود دستی مختصات
  const handleCoordinatesSubmit = () => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      onError?.("لطفاً مختصات معتبر وارد کنید");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      onError?.("مختصات خارج از محدوده معتبر است");
      return;
    }

    onChange({
      latitude: lat,
      longitude: lng,
      address: `موقعیت دستی (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
    onError?.("");
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="gps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gps">GPS</TabsTrigger>
          <TabsTrigger value="city">شهر</TabsTrigger>
          <TabsTrigger value="coordinates">مختصات</TabsTrigger>
        </TabsList>

        {/* GPS Tab */}
        <TabsContent value="gps" className="space-y-2">
          {value ? (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{value.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                  >
                    تغییر
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="w-full gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isLoading ? "در حال دریافت..." : "دریافت موقعیت از GPS"}
            </Button>
          )}
        </TabsContent>

        {/* City Tab */}
        <TabsContent value="city" className="space-y-2">
          <div className="space-y-2">
            <Label>انتخاب شهر</Label>
            <Select value={selectedCity} onValueChange={handleCitySelect}>
              <SelectTrigger>
                <SelectValue placeholder="شهر را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCity && (
              <p className="text-xs text-muted-foreground">
                شهر {selectedCity} انتخاب شد
              </p>
            )}
          </div>
        </TabsContent>

        {/* Coordinates Tab */}
        <TabsContent value="coordinates" className="space-y-2">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>عرض جغرافیایی (Latitude)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="مثال: 36.917"
                  value={coordinates.latitude}
                  onChange={(e) =>
                    setCoordinates({
                      ...coordinates,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>طول جغرافیایی (Longitude)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="مثال: 50.658"
                  value={coordinates.longitude}
                  onChange={(e) =>
                    setCoordinates({
                      ...coordinates,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCoordinatesSubmit}
              className="w-full gap-2"
              disabled={
                !coordinates.latitude || !coordinates.longitude
              }
            >
              <Search className="h-4 w-4" />
              اعمال مختصات
            </Button>
            {coordinates.latitude && coordinates.longitude && (
              <p className="text-xs text-muted-foreground">
                مختصات: {coordinates.latitude}, {coordinates.longitude}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

