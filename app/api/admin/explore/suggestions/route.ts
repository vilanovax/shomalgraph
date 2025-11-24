import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { suggestionId, action, adminNote } = await req.json();

    if (!suggestionId || !action) {
      return NextResponse.json(
        { error: "Suggestion ID and action are required" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Update suggestion status
    const suggestion = await db.itemSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        adminNote: adminNote || null,
      },
    });

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error("Error processing suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
