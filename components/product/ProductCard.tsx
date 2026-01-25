"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";
import { urlFor } from "@/lib/sanity";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCartStore();

  const imageUrl = product.images?.[0]
    ? urlFor(product.images[0]).width(600).height(600).fit("crop").url()
    : "/placeholder-product.jpg";

  const secondImageUrl = product.images?.[1]
    ? urlFor(product.images[1]).width(600).height(600).fit("crop").url()
    : null;

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;

    setIsAdding(true);
    addItem({
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug.current,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
    setIsAdding(false);
    openCart();
  };

  return (
    <div className="group relative">
      <Link href={`/shop/${product.slug.current}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 product-image-zoom">
          <Image
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              secondImageUrl &&
                "group-hover:opacity-0"
            )}
          />
          {secondImageUrl && (
            <Image
              src={secondImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            )}
            {product.featured && !discount && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                Featured
              </span>
            )}
            {!product.inStock && (
              <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold text-white">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
              toast.success(
                isWishlisted ? "Removed from wishlist" : "Added to wishlist"
              );
            }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              )}
            />
          </button>

          {/* Quick Add Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock || isAdding}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                product.inStock
                  ? "bg-gray-900 hover:bg-gray-700"
                  : "bg-gray-400 cursor-not-allowed",
                isAdding && "opacity-80"
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.inStock
                ? isAdding
                  ? "Adding…"
                  : "Quick Add"
                : "Sold Out"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          {product.category?.name && (
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          {/* Star rating placeholder */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3 w-3",
                  star <= 4
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
            <span className="text-xs text-gray-400">(24)</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
