"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Key,
  Search,
  MapPin,
  Database,
  Cloud,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface SettingItem {
  key: string;
  value: string;
  category: string;
  description?: string;
  isSecret: boolean;
}

const SETTING_CATEGORIES = [
  {
    id: "api",
    title: "کلیدهای API",
    icon: Key,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "storage",
    title: "ذخیره‌سازی",
    icon: Cloud,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "map",
    title: "نقشه",
    icon: MapPin,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "database",
    title: "دیتابیس",
    icon: Database,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
];

const DEFAULT_SETTINGS: SettingItem[] = [
  {
    key: "OPENAI_API_KEY",
    value: "",
    category: "api",
    description: "کلید API هوش مصنوعی OpenAI",
    isSecret: true,
  },
  {
    key: "GOOGLE_SEARCH_API_KEY",
    value: "",
    category: "api",
    description: "کلید API جستجوی Google",
    isSecret: true,
  },
  {
    key: "GOOGLE_SEARCH_ENGINE_ID",
    value: "",
    category: "api",
    description: "شناسه موتور جستجوی Google",
    isSecret: false,
  },
  {
    key: "NESHAN_API_KEY",
    value: "",
    category: "map",
    description: "کلید API نقشه نشان",
    isSecret: true,
  },
  {
    key: "LIARA_ENDPOINT",
    value: "",
    category: "storage",
    description: "آدرس endpoint لیارا",
    isSecret: false,
  },
  {
    key: "LIARA_ACCESS_KEY",
    value: "",
    category: "storage",
    description: "کلید دسترسی لیارا",
    isSecret: true,
  },
  {
    key: "LIARA_SECRET_KEY",
    value: "",
    category: "storage",
    description: "کلید مخفی لیارا",
    isSecret: true,
  },
  {
    key: "LIARA_BUCKET_NAME",
    value: "",
    category: "storage",
    description: "نام bucket لیارا",
    isSecret: false,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          // Merge with defaults
          const merged = DEFAULT_SETTINGS.map((defaultSetting) => {
            const saved = data.settings.find(
              (s: SettingItem) => s.key === defaultSetting.key
            );
            return saved || defaultSetting;
          });
          setSettings(merged);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getSettingsByCategory = (categoryId: string) => {
    return settings.filter((s) => s.category === categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">تنظیمات سیستم</h1>
              <p className="text-gray-300 text-sm mt-1">
                مدیریت کلیدهای API و تنظیمات سیستم
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <Card
          className={`border-2 ${
            saveStatus === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {saveStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    تنظیمات با موفقیت ذخیره شد
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    خطا در ذخیره تنظیمات
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings by Category */}
      {SETTING_CATEGORIES.map((category) => {
        const categorySettings = getSettingsByCategory(category.id);
        if (categorySettings.length === 0) return null;

        const Icon = category.icon;

        return (
          <Card
            key={category.id}
            className={`border-2 ${category.borderColor} hover:shadow-lg transition-all`}
          >
            <CardHeader className={`bg-gradient-to-r ${category.bgColor} border-b`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 ${category.bgColor} rounded-lg`}>
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <CardTitle>{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {categorySettings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="text-sm font-medium">
                      {setting.key}
                      {setting.isSecret && (
                        <Badge variant="outline" className="mr-2 text-xs">
                          محرمانه
                        </Badge>
                      )}
                    </Label>
                    {setting.isSecret && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSecretVisibility(setting.key)}
                        className="h-7"
                      >
                        {visibleSecrets.has(setting.key) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      id={setting.key}
                      type={
                        setting.isSecret && !visibleSecrets.has(setting.key)
                          ? "password"
                          : "text"
                      }
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      placeholder={`وارد کردن ${setting.key}...`}
                      className="pr-10"
                      dir="ltr"
                    />
                    {setting.isSecret && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Save Button */}
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Save className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">ذخیره تنظیمات</p>
                <p className="text-sm text-muted-foreground">
                  تمام تغییرات را ذخیره کنید
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  ذخیره همه
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

