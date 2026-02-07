import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DBOrder = {
  id: string;
  orderNumber: string;
  stripeSessionId: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  items: unknown;
  createdAt: Date;
};
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, ArrowRight, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your order history",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const orders: DBOrder[] = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-gray-900">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">My Orders</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  My Orders
                </h1>
                <p className="mt-1 text-gray-500">
                  {orders.length === 0
                    ? "No orders yet"
                    : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
                </p>
              </div>
              <Link href="/shop" className="btn-secondary hidden sm:flex">
                <ShoppingBag className="h-4 w-4" />
                Shop Again
              </Link>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-6">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                When you place your first order, it will appear here.
              </p>
              <Link href="/shop" className="btn-primary">
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: DBOrder) => {
                const items = order.items as { name: string; quantity: number; price: number; image?: string }[];
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Order placed</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Order #</p>
                          <p className="font-medium text-gray-900 font-mono text-xs">
                            {order.orderNumber.slice(0, 12)}…
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="px-6 py-4">
                      <div className="space-y-3">
                        {items?.slice(0, 3).map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-3"
                          >
                            <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} ·{" "}
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {items?.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{items.length - 3} more items
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {items?.length} {items?.length === 1 ? "item" : "items"}
                        </p>
                        <Link
                          href={`/order-success?session_id=${order.stripeSessionId}`}
                          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
