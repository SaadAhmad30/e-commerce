import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const userId = searchParams.get("userId");

  try {
    if (sessionId) {
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    if (userId) {
      // Verify the user is requesting their own orders
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    return NextResponse.json(
      { error: "session_id or userId required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[ORDERS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
