import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/utils";

interface CheckoutItem {
  productId: string;
  name: string;
  price: number; // in cents
  quantity: number;
  image?: string;
  variant?: {
    key?: string;
    size?: string;
    color?: string;
    sku?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      userId,
      customerEmail,
    }: { items: CheckoutItem[]; userId?: string; customerEmail?: string } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "No items provided" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax = Math.round(subtotal * TAX_RATE);

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.productId,
            variantKey: item.variant?.key ?? "",
            variantSize: item.variant?.size ?? "",
            variantColor: item.variant?.color ?? "",
            variantSku: item.variant?.sku ?? "",
          },
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shipping,
              currency: "usd",
            },
            display_name:
              shipping === 0 ? "Free Shipping" : "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      tax_id_collection: { enabled: false },
      invoice_creation: {
        enabled: true,
      },
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: {
        userId: userId ?? "",
        itemsJson: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image ?? "",
            variant: i.variant
              ? [i.variant.size, i.variant.color].filter(Boolean).join(" / ")
              : "",
          }))
        ),
        subtotal: String(subtotal),
        shipping: String(shipping),
        tax: String(tax),
        total: String(subtotal + shipping + tax),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
