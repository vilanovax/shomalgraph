"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Loader2 } from "lucide-react";
import { ChecklistCard } from "@/components/checklist/ChecklistCard";
import { ChecklistSelector } from "@/components/checklist/ChecklistSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Checklist {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  templateId?: string | null;
  template?: {
    id: string;
    title: string;
    icon?: string | null;
  } | null;
  progress: number;
  checkedCount: number;
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function ProfileChecklists() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/checklists");
      const data = await response.json();
      if (data.success) {
        setChecklists(data.data);
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistCreated = () => {
    setIsDialogOpen(false);
    fetchChecklists();
  };

  if (isLoading) {
    return (
      <Card className="border-2 hover:border-green-300 transition-colors">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 hover:border-green-300 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>چک‌لیست‌های سفر</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">افزودن</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                هنوز چک‌لیستی ایجاد نکرده‌اید
              </p>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                ایجاد اولین چک‌لیست
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.slice(0, 5).map((checklist) => (
                <div
                  key={checklist.id}
                  onClick={() => router.push(`/checklists/${checklist.id}`)}
                  className="cursor-pointer"
                >
                  <ChecklistCard checklist={checklist} />
                </div>
              ))}
              {checklists.length > 5 && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/checklists")}
                >
                  مشاهده همه ({checklists.length} چک‌لیست)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for creating new checklist */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ایجاد چک‌لیست جدید</DialogTitle>
          </DialogHeader>
          <ChecklistSelector onChecklistCreated={handleChecklistCreated} />
        </DialogContent>
      </Dialog>
    </>
  );
}

