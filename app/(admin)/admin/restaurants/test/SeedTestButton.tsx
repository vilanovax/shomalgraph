"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { seedRestaurants } from "../seed-action";

export function SeedTestButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedRestaurants();
      if (result.success) {
        alert(`✅ ${result.message}`);
        router.refresh();
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ خطا در افزودن رستوران‌ها");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={loading} size="lg">
      {loading ? (
        <>
          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          در حال افزودن...
        </>
      ) : (
        <>
          <Database className="ml-2 h-5 w-5" />
          افزودن 10 رستوران نمونه
        </>
      )}
    </Button>
  );
}

