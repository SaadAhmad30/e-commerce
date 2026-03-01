"use client";

import { useState } from "react";
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
} from "lucide-react";
import { urlFor } from "@/lib/sanity";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { Product, ProductVariant } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.length ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { addItem, openCart } = useCartStore();

  const images = product.images || [];
  const activePrice = selectedVariant
    ? product.price + (selectedVariant.priceAdjustment || 0)
    : product.price;
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - activePrice) / product.compareAtPrice) * 100
      )
    : null;

  const sizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean) ?? [])
  );
  const colors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean) ?? [])
  );

  const handleAddToCart = () => {
    setAdding(true);
    const imageUrl = images[0]
      ? urlFor(images[0]).width(400).height(400).fit("crop").url()
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
      {/* ── Images ── */}
      <div className="space-y-4">
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

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "h-4 w-4",
                  s <= 4
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">4.2 (24 reviews)</span>
        </div>

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

        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 w-fit">
          <Share2 className="h-4 w-4" />
          Share
        </button>

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

        <p className="mt-4 text-xs text-gray-400">
          SKU: {selectedVariant?.sku || product.sku}
        </p>

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

        {product.description && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Description
            </h2>
            <div className="space-y-2">
              {Array.isArray(product.description) &&
                product.description.map((block: any, i: number) =>
                  block._type === "block" ? (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">
                      {block.children?.map((child: any) => child.text).join("")}
                    </p>
                  ) : null
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
