"use client";

import { useState } from "react";
import { ListItemCard } from "./ListItemCard";
import { CommentsSection } from "./CommentsSection";
import { Prisma } from "@prisma/client";

type ListItemWithRelations = Prisma.ListItemGetPayload<{
  include: {
    restaurant: {
      include: {
        category: true;
      };
    };
    place: {
      include: {
        category: true;
      };
    };
    _count: {
      select: {
        likes: true;
        dislikes: true;
        comments: true;
      };
    };
  };
}>;

interface ListDetailClientProps {
  items: ListItemWithRelations[];
}

export function ListDetailClient({ items }: ListDetailClientProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            این لیست هنوز آیتمی ندارد
          </div>
        ) : (
          items.map((item, index) => (
            <ListItemCard
              key={item.id}
              item={item}
              index={index}
              onCommentClick={setSelectedItemId}
            />
          ))
        )}
      </div>

      <CommentsSection
        itemId={selectedItemId}
        isOpen={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}
