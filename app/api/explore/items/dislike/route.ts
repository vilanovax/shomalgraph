import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Check if already disliked
    const existingDislike = await db.itemDislike.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    if (existingDislike) {
      // Remove dislike
      await db.itemDislike.delete({
        where: { id: existingDislike.id },
      });

      return NextResponse.json({ disliked: false });
    } else {
      // Dislike
      await db.itemDislike.create({
        data: {
          userId: session.user.id,
          itemId,
        },
      });

      // Remove like if exists
      await db.itemLike.deleteMany({
        where: {
          userId: session.user.id,
          itemId,
        },
      });

      return NextResponse.json({ disliked: true });
    }
  } catch (error) {
    console.error("Error toggling item dislike:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
