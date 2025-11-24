import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await req.json();

    if (!listId) {
      return NextResponse.json({ error: "List ID is required" }, { status: 400 });
    }

    // Check if already liked
    const existingLike = await db.listLike.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.listLike.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.listLike.create({
        data: {
          userId: session.user.id,
          listId,
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling list like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
