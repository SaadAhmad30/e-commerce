import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, getProductCount } from "@/lib/sanity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const products = await getAllProducts({
      category: searchParams.get("category") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sort: (searchParams.get("sort") as any) ?? undefined,
      q: searchParams.get("q") ?? undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 20,
      offset: searchParams.get("offset")
        ? Number(searchParams.get("offset"))
        : 0,
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
