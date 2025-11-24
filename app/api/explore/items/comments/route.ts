import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET comments for an item
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const comments = await db.itemComment.findMany({
      where: { itemId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, comment } = await req.json();

    if (!itemId || !comment) {
      return NextResponse.json(
        { error: "Item ID and comment are required" },
        { status: 400 }
      );
    }

    const newComment = await db.itemComment.create({
      data: {
        userId: session.user.id,
        itemId,
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
