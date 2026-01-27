import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { getFeaturedProducts, getAllCategories } from "@/lib/sanity";
import ProductCard from "@/components/product/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Premium E-Commerce Store",
  description: "Shop the finest curated collection. Premium quality, modern design.",
};

export const revalidate = 60;

const PERKS = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On all orders over $50",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "256-bit SSL encryption",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30-day hassle-free returns",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "We're here to help",
  },
];

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getAllCategories(),
  ]);

  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              New Collection Available
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Discover
              <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Premium Style
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              Curated products for the modern lifestyle. Quality you can trust,
              style you'll love — at prices that make sense.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary text-base px-8 py-4">
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/shop?sort=featured"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 40 960 60 720 60C480 60 240 40 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── Perks ──────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ───────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                Handpicked
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop?sort=featured"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 group"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link href="/shop?sort=featured" className="btn-secondary">
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Categories ──────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                Browse
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Shop by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat.slug.current}`}
                  className="group relative overflow-hidden rounded-2xl bg-gray-200 aspect-square hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-end p-5 z-20">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="mt-0.5 text-xs text-white/70 line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Placeholder gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-110 transition-transform duration-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Promotional Banner ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-10 md:p-16 text-white text-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3 opacity-80">
              Limited Time
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Up to 40% Off
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
              Shop our seasonal sale. Premium products at unbeatable prices.
              Don&apos;t miss out!
            </p>
            <Link
              href="/shop?sort=price-asc"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 hover:bg-gray-100 transition-colors"
            >
              Shop Sale
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
