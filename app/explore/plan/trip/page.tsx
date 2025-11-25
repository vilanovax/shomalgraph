import { TripPlanForm } from "@/components/travel/TripPlanForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TripPlanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/explore/plan">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>
        </div>
        <TripPlanForm />
      </div>
    </div>
  );
}

