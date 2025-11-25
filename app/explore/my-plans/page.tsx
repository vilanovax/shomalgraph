import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TravelPlanCard } from "@/components/travel/TravelPlanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export default async function MyPlansPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const plans = await db.travelPlan.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">برنامه‌های من</h1>
            <p className="text-muted-foreground">
              تمام برنامه‌های سفر شما در یک جا
            </p>
          </div>
          <Link href="/explore/plan">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              برنامه جدید
            </Button>
          </Link>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                هنوز برنامه‌ای ایجاد نکرده‌اید
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                اولین برنامه سفر خود را ایجاد کنید
              </p>
              <Link href="/explore/plan">
                <Button>ایجاد برنامه جدید</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <TravelPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

