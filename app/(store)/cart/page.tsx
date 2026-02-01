"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-14 w-14 text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-500 max-w-sm">
              Looks like you haven&apos;t added any items yet. Start shopping to
              fill it up!
            </p>
          </div>
          <Link href="/shop" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Shopping Cart
          <span className="ml-3 text-lg font-normal text-gray-400">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-sm text-gray-400">
                        {[item.variant.size, item.variant.color]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty */}
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <p className="font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-50 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
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

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    Add{" "}
                    <strong>
                      {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                    </strong>{" "}
                    more for free shipping!
                  </p>
                  <div className="mt-1.5 h-1.5 bg-blue-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center">
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Accepted payments */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {["VISA", "MC", "AMEX"].map((card) => (
                <span
                  key={card}
                  className="flex h-6 w-10 items-center justify-center rounded border border-gray-200 text-[10px] font-bold text-gray-500"
                >
                  {card}
                </span>
              ))}
              <span className="flex h-6 items-center justify-center rounded bg-blue-600 px-2 text-[10px] font-bold text-white">
                Stripe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
