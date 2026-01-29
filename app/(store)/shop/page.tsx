import { Suspense } from "react";
import { getAllProducts, getAllCategories, getProductCount } from "@/lib/sanity";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";
import type { SearchParams } from "@/types";
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full collection of premium products.",
};

export const revalidate = 60;

const PRODUCTS_PER_PAGE = 12;

interface ShopPageProps {
  searchParams: SearchParams;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Number(searchParams.page ?? 1);
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  const [products, categories, totalCount] = await Promise.all([
    getAllProducts({
      category: searchParams.category,
      minPrice: searchParams.minPrice
        ? Number(searchParams.minPrice)
        : undefined,
      maxPrice: searchParams.maxPrice
        ? Number(searchParams.maxPrice)
        : undefined,
      sort: searchParams.sort as any,
      q: searchParams.q,
      limit: PRODUCTS_PER_PAGE,
      offset,
    }),
    getAllCategories(),
    getProductCount({
      category: searchParams.category,
      minPrice: searchParams.minPrice
        ? Number(searchParams.minPrice)
        : undefined,
      maxPrice: searchParams.maxPrice
        ? Number(searchParams.maxPrice)
        : undefined,
      q: searchParams.q,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          {searchParams.q
            ? `Results for "${searchParams.q}"`
            : searchParams.category
            ? `${searchParams.category.replace(/-/g, " ")}`
            : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? "product" : "products"} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters categories={categories} />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full">
                <SlidersHorizontal className="h-4 w-4" />
                Filters & Sort
              </summary>
              <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-white">
                <ProductFilters categories={categories} />
              </div>
            </details>
          </div>

          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const params = new URLSearchParams();
                  if (searchParams.category)
                    params.set("category", searchParams.category);
                  if (searchParams.sort) params.set("sort", searchParams.sort);
                  if (searchParams.q) params.set("q", searchParams.q);
                  if (pageNum > 1) params.set("page", String(pageNum));
                  return (
                    <a
                      key={pageNum}
                      href={`/shop?${params.toString()}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        pageNum === page
                          ? "bg-gray-900 text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </a>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
