import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId, restaurantId, placeId, note } = await req.json();

    // Must have either restaurantId or placeId
    if (!restaurantId && !placeId) {
      return NextResponse.json(
        { error: "Either restaurant or place must be specified" },
        { status: 400 }
      );
    }

    // Cannot have both
    if (restaurantId && placeId) {
      return NextResponse.json(
        { error: "Cannot suggest both restaurant and place" },
        { status: 400 }
      );
    }

    // Verify the item exists
    if (restaurantId) {
      const restaurant = await db.restaurant.findUnique({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }
    }

    if (placeId) {
      const place = await db.touristPlace.findUnique({
        where: { id: placeId },
      });
      if (!place) {
        return NextResponse.json(
          { error: "Place not found" },
          { status: 404 }
        );
      }
    }

    // Create suggestion
    const suggestion = await db.itemSuggestion.create({
      data: {
        userId: session.user.id,
        listId: listId || null,
        restaurantId: restaurantId || null,
        placeId: placeId || null,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error("Error creating item suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
