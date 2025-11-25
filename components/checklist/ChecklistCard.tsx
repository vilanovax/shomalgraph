"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fa } from "date-fns/locale";

interface ChecklistCardProps {
  checklist: {
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
  };
  onDelete?: (id: string) => void;
}

const travelTypeLabels: Record<string, string> = {
  FAMILY_WITH_KIDS: "خانواده با بچه",
  NATURE: "طبیعت",
  BEACH: "ساحل",
  URBAN: "شهری",
  COUPLE: "زوج",
  FRIENDS: "دوستان",
  SOLO: "تنها",
  OTHER: "سایر",
};

export function ChecklistCard({ checklist, onDelete }: ChecklistCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {checklist.template && (
                <Badge variant="secondary" className="text-xs">
                  از قالب: {checklist.template.title}
                </Badge>
              )}
              {checklist.travelType && (
                <Badge variant="outline" className="text-xs">
                  {travelTypeLabels[checklist.travelType] || checklist.travelType}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">{checklist.title}</h3>
            {checklist.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {checklist.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checklist.progress !== undefined && (
            <ChecklistProgress
              checkedCount={checklist.checkedCount || 0}
              totalCount={checklist.totalCount || 0}
            />
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(checklist.createdAt), "d MMMM yyyy", {
                locale: fa,
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link href={`/checklists/${checklist.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                مشاهده
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <Link href={`/checklists/${checklist.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(checklist.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

