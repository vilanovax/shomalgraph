import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeedTestButton } from "./SeedTestButton";

export default async function TestRestaurantsPage() {
  const restaurants = await db.restaurant.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await db.category.findMany();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تست رستوران‌ها</h1>
        <SeedTestButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>دسته‌بندی‌ها ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="p-2 bg-muted rounded">
                <strong>{cat.name}</strong> - {cat.slug} (ID: {cat.id})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>رستوران‌ها ({restaurants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurants.length === 0 ? (
              <p className="text-muted-foreground">هیچ رستورانی یافت نشد</p>
            ) : (
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="p-4 border rounded-lg">
                  <div className="font-bold text-lg">{restaurant.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Slug: {restaurant.slug}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    آدرس: {restaurant.address}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    وضعیت: {restaurant.isActive ? "فعال" : "غیرفعال"} |{" "}
                    {restaurant.isVerified ? "تایید شده" : "تایید نشده"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    دسته: {restaurant.category?.name || "بدون دسته"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ایجاد شده: {new Date(restaurant.createdAt).toLocaleString("fa-IR")}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

