import { PlanTypeSelector } from "@/components/travel/PlanTypeSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function PlanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            برنامه‌ریزی سفر هوشمند
          </h1>
          <p className="text-muted-foreground text-lg">
            با کمک هوش مصنوعی و الگوریتم‌های پیشرفته، بهترین برنامه سفر را برای خودت بساز
          </p>
        </div>

        {/* Plan Type Selector */}
        <PlanTypeSelector className="mb-8" />

        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-muted/50 to-background">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">چطور کار می‌کنه؟</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>موقعیت فعلی‌ت رو مشخص کن یا از GPS استفاده کن</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>نوع سفر و علایقت رو انتخاب کن</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>سیستم با هوش مصنوعی بهترین پیشنهادات رو برات می‌سازه</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>برنامه رو ذخیره کن و از سفرت لذت ببر</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

