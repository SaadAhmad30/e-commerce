"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variant: item.variant,
          })),
          userId: session?.user?.id,
          customerEmail: session?.user?.email,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Checkout failed");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account info */}
          {session ? (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Signed in as {session.user?.name}
                </p>
                <p className="text-xs text-green-700">{session.user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                <Link href="/login" className="font-semibold underline">
                  Sign in
                </Link>{" "}
                to save your order history and get a faster checkout experience.
              </p>
            </div>
          )}

          {/* Secure checkout notice */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Secure Stripe Checkout
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              You will be securely redirected to Stripe to complete your
              payment. We never store your card details. Your payment is
              protected with 256-bit SSL encryption.
            </p>

            {/* Order items preview */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-gray-400">
                        {[item.variant.size, item.variant.color]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full text-base py-4 h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirecting to Stripe…
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Pay {formatPrice(total)} with Stripe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Payments secured by Stripe
              </p>
              <p>30-day money-back guarantee</p>
              <p>Free returns on all orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
