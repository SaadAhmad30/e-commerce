"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const total = totalPrice();
  const freeShippingProgress = Math.min(
    (total / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Your Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Start shopping to add items to your cart.
              </p>
            </div>
            <button onClick={closeCart} className="btn-primary mt-2">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            {total < FREE_SHIPPING_THRESHOLD && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700 mb-1.5">
                  Add <strong>{formatPrice(remaining)}</strong> more for free
                  shipping!
                </p>
                <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
            {total >= FREE_SHIPPING_THRESHOLD && (
              <div className="px-6 py-2 bg-green-50 border-b border-green-100">
                <p className="text-xs font-medium text-green-700">
                  🎉 You qualify for free shipping!
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {[item.variant.size, item.variant.color]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Qty control */}
                      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-7 w-7 items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-100 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {total >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(SHIPPING_COST)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(Math.round(total * 0.08))}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      total +
                        (total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST) +
                        Math.round(total * 0.08)
                    )}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full text-center"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary w-full text-center"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
