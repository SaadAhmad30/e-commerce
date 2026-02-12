import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[WEBHOOK_SIGNATURE_ERROR]", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("[WEBHOOK_HANDLER_ERROR]", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  const items = metadata.itemsJson ? JSON.parse(metadata.itemsJson) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shippingDetails = (session as any).shipping_details ?? null;

  const shippingAddress = {
    name: shippingDetails?.name ?? session.customer_details?.name ?? "",
    line1: shippingDetails?.address?.line1 ?? "",
    line2: shippingDetails?.address?.line2 ?? "",
    city: shippingDetails?.address?.city ?? "",
    state: shippingDetails?.address?.state ?? "",
    postalCode: shippingDetails?.address?.postal_code ?? "",
    country: shippingDetails?.address?.country ?? "",
  };

  const userId = metadata.userId || null;

  // Check if order already exists
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existing) {
    console.log("[WEBHOOK] Order already exists for session:", session.id);
    return;
  }

  await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      userId: userId || null,
      customerEmail: session.customer_details?.email ?? "",
      customerName: session.customer_details?.name ?? "",
      items,
      shippingAddress,
      subtotal: Number(metadata.subtotal ?? 0),
      tax: Number(metadata.tax ?? 0),
      shipping: Number(metadata.shipping ?? 0),
      total: Number(metadata.total ?? session.amount_total ?? 0),
      status: "PAID",
    },
  });

  console.log(
    "[WEBHOOK] Order created for session:",
    session.id
  );
}
