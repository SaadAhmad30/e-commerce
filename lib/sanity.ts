import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;
import type { Product, Category } from "@/types";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ─── GROQ Queries ────────────────────────────────────────────────

export const productFields = `
  _id,
  name,
  slug,
  sku,
  price,
  compareAtPrice,
  "images": images[]{..., "alt": alt},
  "category": category->{_id, name, slug},
  tags,
  variants,
  featured,
  inStock,
  description
`;

export async function getAllProducts(params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const filters: string[] = ['_type == "product"', "inStock == true"];

  if (params?.category) {
    filters.push(`category->slug.current == $category`);
  }
  if (params?.minPrice !== undefined) {
    filters.push(`price >= $minPrice`);
  }
  if (params?.maxPrice !== undefined) {
    filters.push(`price <= $maxPrice`);
  }
  if (params?.q) {
    filters.push(
      `(name match $q || pt::text(description) match $q || $q in tags)`
    );
  }

  const sortMap: Record<string, string> = {
    "price-asc": "price asc",
    "price-desc": "price desc",
    newest: "_createdAt desc",
    featured: "featured desc, _createdAt desc",
  };
  const orderBy = sortMap[params?.sort ?? ""] ?? "_createdAt desc";

  const limit = params?.limit ?? 100;
  const offset = params?.offset ?? 0;

  const query = `*[${filters.join(" && ")}] | order(${orderBy}) [${offset}...${offset + limit}] {${productFields}}`;

  return sanityClient.fetch<Product[]>(query, {
    category: params?.category ?? "",
    minPrice: params?.minPrice ?? 0,
    maxPrice: params?.maxPrice ?? 9999999,
    q: params?.q ? `${params.q}*` : "",
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return sanityClient.fetch<Product>(
    `*[_type == "product" && slug.current == $slug][0] {${productFields}}`,
    { slug },
    { next: { revalidate: 60 } }
  );
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return sanityClient.fetch<Product[]>(
    `*[_type == "product" && featured == true && inStock == true] | order(_createdAt desc) [0...$limit] {${productFields}}`,
    { limit },
    { next: { revalidate: 60 } }
  );
}

export async function getAllCategories(): Promise<Category[]> {
  return sanityClient.fetch<Category[]>(
    `*[_type == "category"] | order(order asc) {
      _id, name, slug, description,
      "image": image{..., "alt": alt}
    }`,
    {},
    { next: { revalidate: 3600 } }
  );
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<Product[]> {
  return sanityClient.fetch<Product[]>(
    `*[_type == "product" && _id != $productId && category._ref == $categoryId && inStock == true] | order(_createdAt desc) [0...$limit] {${productFields}}`,
    { productId, categoryId, limit }
  );
}

export async function getProductCount(params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}): Promise<number> {
  const filters: string[] = ['_type == "product"', "inStock == true"];
  if (params?.category) filters.push(`category->slug.current == $category`);
  if (params?.minPrice !== undefined) filters.push(`price >= $minPrice`);
  if (params?.maxPrice !== undefined) filters.push(`price <= $maxPrice`);
  if (params?.q) filters.push(`name match $q`);

  return sanityClient.fetch<number>(
    `count(*[${filters.join(" && ")}])`,
    {
      category: params?.category ?? "",
      minPrice: params?.minPrice ?? 0,
      maxPrice: params?.maxPrice ?? 9999999,
      q: params?.q ? `${params.q}*` : "",
    }
  );
}
