"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChecklistCard } from "@/components/checklist/ChecklistCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList } from "lucide-react";

interface ChecklistListClientProps {
  checklists: Array<{
    id: string;
    title: string;
    description?: string | null;
    travelType?: string | null;
    createdAt: Date;
    template?: {
      id: string;
      title: string;
      icon?: string | null;
    } | null;
    progress?: number;
    checkedCount?: number;
    totalCount?: number;
  }>;
}

export function ChecklistListClient({ checklists: initialChecklists }: ChecklistListClientProps) {
  const router = useRouter();
  const [checklists, setChecklists] = useState(initialChecklists);
  const [search, setSearch] = useState("");
  const [travelType, setTravelType] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این چک‌لیست را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف چک‌لیست");
      }

      setChecklists(checklists.filter((c) => c.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting checklist:", error);
      alert("خطا در حذف چک‌لیست");
    }
  };

  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch =
      !search ||
      checklist.title.toLowerCase().includes(search.toLowerCase()) ||
      checklist.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !travelType || checklist.travelType === travelType;

    return matchesSearch && matchesType;
  });

  if (checklists.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-muted rounded-full mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            هنوز چک‌لیستی ایجاد نکرده‌اید
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            اولین چک‌لیست سفر خود را ایجاد کنید
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="جستجو در چک‌لیست‌ها..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={travelType || "all"} onValueChange={(value) => setTravelType(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="نوع سفر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="FAMILY_WITH_KIDS">خانواده با بچه</SelectItem>
            <SelectItem value="NATURE">طبیعت</SelectItem>
            <SelectItem value="BEACH">ساحل</SelectItem>
            <SelectItem value="URBAN">شهری</SelectItem>
            <SelectItem value="COUPLE">زوج</SelectItem>
            <SelectItem value="FRIENDS">دوستان</SelectItem>
            <SelectItem value="SOLO">تنها</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checklists Grid */}
      {filteredChecklists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              هیچ چک‌لیستی با این فیلترها یافت نشد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

