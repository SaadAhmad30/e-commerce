"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $25", min: undefined, max: 2500 },
  { label: "$25 – $50", min: 2500, max: 5000 },
  { label: "$50 – $100", min: 5000, max: 10000 },
  { label: "Over $100", min: 10000, max: undefined },
];

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const hasFilters =
    activeCategory || minPrice || maxPrice || searchParams.get("sort");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Sort By
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("sort", opt.value)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                activeSort === opt.value
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Category
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => updateParam("category", undefined)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                !activeCategory
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateParam("category", cat.slug.current)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  activeCategory === cat.slug.current
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Price Range
        </h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive =
              (range.min === undefined
                ? !minPrice
                : minPrice === String(range.min)) &&
              (range.max === undefined
                ? !maxPrice
                : maxPrice === String(range.max));
            return (
              <button
                key={range.label}
                onClick={() => {
                  updateParam(
                    "minPrice",
                    range.min !== undefined ? String(range.min) : undefined
                  );
                  updateParam(
                    "maxPrice",
                    range.max !== undefined ? String(range.max) : undefined
                  );
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
