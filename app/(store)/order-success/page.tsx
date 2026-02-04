"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  ShoppingBag,
  Package,
  Truck,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [sessionId]);

  const steps = [
    { icon: CheckCircle, label: "Order Placed", done: true },
    { icon: Package, label: "Processing", done: true },
    { icon: Truck, label: "Shipped", done: false },
    { icon: Mail, label: "Delivered", done: false },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Icon */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. You&apos;ll receive a confirmation email
          shortly.
        </p>
        {order?.orderNumber && (
          <p className="mt-3 text-sm text-gray-500">
            Order #{" "}
            <span className="font-semibold text-gray-900">
              {order.orderNumber}
            </span>
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200" />
          <div
            className="absolute top-5 left-8 h-0.5 bg-green-500 transition-all"
            style={{ right: "75%" }}
          />
          {steps.map(({ icon: Icon, label, done }, i) => (
            <div
              key={label}
              className="relative flex flex-col items-center gap-2 z-10"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs font-medium ${
                  done ? "text-green-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-16 rounded" />
            <div className="skeleton h-16 rounded" />
          </div>
        </div>
      ) : order ? (
        <div className="rounded-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Order Details</h2>
          </div>
          <div className="p-6 space-y-4">
            {Array.isArray(order.items) &&
              order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-gray-400">{item.variant}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">×{item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            <div className="border-t border-gray-100 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(order.shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 mb-8 text-center">
          <p className="text-sm text-blue-800">
            Your order has been placed! Check your email for confirmation
            details.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/shop" className="btn-primary flex-1 text-center">
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
        <Link
          href="/account/orders"
          className="btn-secondary flex-1 text-center"
        >
          View Order History
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
