import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, reason } = await req.json();

    if (!commentId || !reason) {
      return NextResponse.json(
        { error: "Comment ID and reason are required" },
        { status: 400 }
      );
    }

    // Check if already reported by this user
    const existingReport = await db.commentReport.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this comment" },
        { status: 400 }
      );
    }

    // Create report
    const report = await db.commentReport.create({
      data: {
        userId: session.user.id,
        commentId,
        reason,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error reporting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
