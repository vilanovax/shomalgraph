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

    // Check if already liked
    const existingLike = await db.itemLike.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.itemLike.delete({
        where: { id: existingLike.id },
      });

      // Remove dislike if exists
      await db.itemDislike.deleteMany({
        where: {
          userId: session.user.id,
          itemId,
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.itemLike.create({
        data: {
          userId: session.user.id,
          itemId,
        },
      });

      // Remove dislike if exists
      await db.itemDislike.deleteMany({
        where: {
          userId: session.user.id,
          itemId,
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling item like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
