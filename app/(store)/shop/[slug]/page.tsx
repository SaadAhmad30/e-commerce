"use client";

// Note: This file uses client-side rendering for interactivity.
// For ISR + dynamic data, see the generateStaticParams + revalidate pattern.

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { getProductBySlug, getRelatedProducts, urlFor } from "@/lib/sanity";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/product/ProductCard";
import type { Product, ProductVariant } from "@/types";
import toast from "react-hot-toast";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductBySlug(slug);
        if (!data) return;
        setProduct(data);
        if (data.variants?.length) {
          setSelectedVariant(data.variants[0]);
        }
        const rel = await getRelatedProducts(
          data._id,
          data.category?._id,
          4
        );
        setRelated(rel);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);

    const imageUrl = product.images?.[0]
      ? urlFor(product.images[0]).width(400).height(400).fit("crop").url()
      : "";

    const price = selectedVariant
      ? product.price + (selectedVariant.priceAdjustment || 0)
      : product.price;

    const cartItemId = selectedVariant
      ? `${product._id}-${selectedVariant._key}`
      : product._id;

    addItem({
      id: cartItemId,
      productId: product._id,
      name: product.name,
      price,
      image: imageUrl,
      slug: product.slug.current,
      quantity,
      variant: selectedVariant
        ? {
            key: selectedVariant._key,
            size: selectedVariant.size,
            color: selectedVariant.color,
            sku: selectedVariant.sku,
          }
        : undefined,
    });

    toast.success("Added to cart!");
    setAdding(false);
    openCart();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/4 rounded" />
            <div className="skeleton h-24 rounded" />
            <div className="skeleton h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [];
  const activePrice = selectedVariant
    ? product.price + (selectedVariant.priceAdjustment || 0)
    : product.price;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - activePrice) / product.compareAtPrice) * 100)
    : null;

  // Get unique sizes and colors
  const sizes = Array.from(new Set(product.variants?.map((v) => v.size).filter(Boolean) ?? []));
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean) ?? []));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-gray-900">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/shop?category=${product.category.slug?.current}`}
              className="hover:text-gray-900"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        {/* ── Images ── */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {images[selectedImage] && (
              <Image
                src={urlFor(images[selectedImage])
                  .width(800)
                  .height(800)
                  .fit("crop")
                  .url()}
                alt={images[selectedImage].alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl bg-gray-100 border-2 transition-all",
                    selectedImage === i
                      ? "border-gray-900"
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <Image
                    src={urlFor(img).width(200).height(200).fit("crop").url()}
                    alt={img.alt || `${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col">
          {product.category?.name && (
            <Link
              href={`/shop?category=${product.category.slug?.current}`}
              className="text-xs font-semibold uppercase tracking-widest text-blue-600 hover:text-blue-700 mb-2"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-4 w-4",
                    s <= 4 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.2 (24 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(activePrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-sm font-semibold text-red-700">
                -{discount}%
              </span>
            )}
          </div>

          {/* Color variants */}
          {colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Color:{" "}
                <span className="font-normal text-gray-600">
                  {selectedVariant?.color}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const v = product.variants?.find((v) => v.color === color);
                  const isSelected = selectedVariant?.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => v && setSelectedVariant(v)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size variants */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Size:{" "}
                <span className="font-normal text-gray-600">
                  {selectedVariant?.size}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const v = product.variants?.find((v) => v.size === size);
                  const isSelected = selectedVariant?.size === size;
                  const outOfStock = v && v.stock <= 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && v && setSelectedVariant(v)}
                      disabled={outOfStock}
                      className={cn(
                        "h-10 min-w-[40px] px-3 rounded-lg text-sm font-semibold border-2 transition-all",
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : outOfStock
                          ? "border-gray-100 text-gray-300 line-through cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-12 w-12 items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-12 w-12 items-center justify-center text-base font-semibold text-gray-900 border-x border-gray-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-12 w-12 items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className={cn(
                "flex-1 btn-primary text-base py-3.5 h-12",
                !product.inStock && "opacity-50 cursor-not-allowed"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {adding
                ? "Adding…"
                : product.inStock
                ? "Add to Cart"
                : "Out of Stock"}
            </button>

            <button
              onClick={() => {
                setWishlisted(!wishlisted);
                toast.success(
                  wishlisted ? "Removed from wishlist" : "Added to wishlist"
                );
              }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-all"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  wishlisted && "fill-red-500 text-red-500"
                )}
              />
            </button>
          </div>

          {/* Share */}
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 w-fit">
            <Share2 className="h-4 w-4" />
            Share
          </button>

          {/* Trust badges */}
          <div className="rounded-2xl bg-gray-50 p-5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <Truck className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <span className="font-medium">Free shipping</span> on orders over $50
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <span className="font-medium">Secure checkout</span> with Stripe
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <RotateCcw className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <span className="font-medium">30-day returns</span> — no questions asked
              </div>
            </div>
          </div>

          {/* SKU */}
          <p className="mt-4 text-xs text-gray-400">
            SKU: {selectedVariant?.sku || product.sku}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?q=${tag}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {product.description && (
        <div className="mt-16 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Product Description
          </h2>
          <div className="prose prose-sm prose-gray">
            {/* Render portable text as plain text for simplicity */}
            {Array.isArray(product.description) &&
              product.description.map((block: any, i: number) =>
                block._type === "block" ? (
                  <p key={i} className="text-gray-600 leading-relaxed mb-3">
                    {block.children
                      ?.map((child: any) => child.text)
                      .join("")}
                  </p>
                ) : null
              )}
          </div>
        </div>
      )}

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
