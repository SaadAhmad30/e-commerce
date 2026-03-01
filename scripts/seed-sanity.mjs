import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local for local usage
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch {
  // .env.local not present — rely on environment variables already set
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function uploadImage(seed, label) {
  console.log(`  Uploading image for "${label}"...`);
  const response = await fetch(
    `https://picsum.photos/seed/${seed}/800/800.jpg`
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, {
    filename: `${seed}.jpg`,
    contentType: "image/jpeg",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: label };
}

const categories = [
  { name: "Electronics",      slug: "electronics",     description: "Cutting-edge gadgets and tech for modern life.",           order: 1 },
  { name: "Clothing",         slug: "clothing",        description: "Premium apparel crafted for style and comfort.",           order: 2 },
  { name: "Home & Living",    slug: "home-living",     description: "Beautiful pieces to transform your living space.",        order: 3 },
  { name: "Accessories",      slug: "accessories",     description: "Timeless accessories to complete any look.",             order: 4 },
  { name: "Sports & Outdoors",slug: "sports-outdoors", description: "High-performance gear for active lifestyles.",           order: 5 },
];

const productData = [
  // Electronics
  { name: "Wireless Noise-Cancelling Headphones", sku: "ELEC-001", price: 29999, compareAtPrice: 39999, featured: true,  category: "electronics",    imageSeed: "headphones1",  tags: ["audio","wireless","noise-cancelling"] },
  { name: "Smart Watch Pro",                       sku: "ELEC-002", price: 44999, compareAtPrice: null,  featured: true,  category: "electronics",    imageSeed: "smartwatch1",  tags: ["wearable","fitness","tech"] },
  { name: "Portable Bluetooth Speaker",            sku: "ELEC-003", price: 8999,  compareAtPrice: 12999, featured: false, category: "electronics",    imageSeed: "speaker1",     tags: ["audio","portable","bluetooth"] },
  // Clothing
  { name: "Classic Oxford Shirt",                  sku: "CLTH-001", price: 7999,  compareAtPrice: null,  featured: true,  category: "clothing",       imageSeed: "shirt1",       tags: ["shirt","formal","classic"] },
  { name: "Premium Denim Jacket",                  sku: "CLTH-002", price: 14999, compareAtPrice: 18999, featured: false, category: "clothing",       imageSeed: "jacket1",      tags: ["jacket","denim","casual"] },
  { name: "Merino Wool Sweater",                   sku: "CLTH-003", price: 11999, compareAtPrice: null,  featured: true,  category: "clothing",       imageSeed: "sweater1",     tags: ["sweater","wool","winter"] },
  // Home & Living
  { name: "Artisan Ceramic Mug Set",               sku: "HOME-001", price: 4999,  compareAtPrice: null,  featured: true,  category: "home-living",    imageSeed: "mug1",         tags: ["mug","ceramic","kitchen"] },
  { name: "Linen Throw Blanket",                   sku: "HOME-002", price: 8999,  compareAtPrice: 11999, featured: false, category: "home-living",    imageSeed: "blanket1",     tags: ["blanket","linen","cozy"] },
  { name: "Bamboo Cutting Board Set",              sku: "HOME-003", price: 6999,  compareAtPrice: null,  featured: false, category: "home-living",    imageSeed: "bamboo1",      tags: ["kitchen","bamboo","eco"] },
  // Accessories
  { name: "Genuine Leather Wallet",                sku: "ACCS-001", price: 5999,  compareAtPrice: null,  featured: true,  category: "accessories",    imageSeed: "wallet1",      tags: ["wallet","leather","minimalist"] },
  { name: "Minimalist Silver Watch",               sku: "ACCS-002", price: 19999, compareAtPrice: 24999, featured: true,  category: "accessories",    imageSeed: "watch1",       tags: ["watch","silver","minimalist"] },
  { name: "Silk Scarf",                            sku: "ACCS-003", price: 7999,  compareAtPrice: null,  featured: false, category: "accessories",    imageSeed: "scarf1",       tags: ["scarf","silk","fashion"] },
  // Sports
  { name: "Premium Yoga Mat",                      sku: "SPRT-001", price: 7999,  compareAtPrice: 9999,  featured: true,  category: "sports-outdoors",imageSeed: "yoga1",        tags: ["yoga","fitness","mat"] },
  { name: "Resistance Bands Set",                  sku: "SPRT-002", price: 3999,  compareAtPrice: null,  featured: false, category: "sports-outdoors",imageSeed: "bands1",       tags: ["fitness","resistance","training"] },
  { name: "Stainless Steel Water Bottle",          sku: "SPRT-003", price: 3499,  compareAtPrice: null,  featured: false, category: "sports-outdoors",imageSeed: "bottle1",      tags: ["hydration","eco","outdoors"] },
];

function makeBlock(text) {
  return [
    {
      _type: "block",
      _key: Math.random().toString(36).slice(2),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text, marks: [] }],
    },
  ];
}

function makeVariants(product) {
  if (product.category === "clothing") {
    return ["S", "M", "L", "XL"].map((size) => ({
      _type: "variant",
      _key: Math.random().toString(36).slice(2),
      size,
      color: "Default",
      sku: `${product.sku}-${size}`,
      stock: Math.floor(Math.random() * 50) + 10,
      priceAdjustment: size === "XL" ? 500 : 0,
    }));
  }
  if (product.category === "electronics") {
    return [
      { _type: "variant", _key: Math.random().toString(36).slice(2), size: null, color: "Black", sku: `${product.sku}-BLK`, stock: 25, priceAdjustment: 0 },
      { _type: "variant", _key: Math.random().toString(36).slice(2), size: null, color: "White", sku: `${product.sku}-WHT`, stock: 15, priceAdjustment: 0 },
    ];
  }
  return [];
}

async function seed() {
  console.log("🌱 Starting Sanity seed...\n");

  // Delete existing documents
  console.log("🗑️  Clearing existing data...");
  await client.delete({ query: '*[_type in ["product","category"]]' });

  // Create categories
  console.log("\n📁 Creating categories...");
  const catIdMap = {};
  for (const cat of categories) {
    const doc = await client.create({
      _type: "category",
      name: cat.name,
      slug: { _type: "slug", current: cat.slug },
      description: cat.description,
      order: cat.order,
    });
    catIdMap[cat.slug] = doc._id;
    console.log(`  ✓ ${cat.name}`);
  }

  // Create products
  console.log("\n📦 Creating products...");
  for (const p of productData) {
    const image = await uploadImage(p.imageSeed, p.name);
    const doc = await client.create({
      _type: "product",
      name: p.name,
      slug: { _type: "slug", current: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") },
      sku: p.sku,
      price: p.price,
      ...(p.compareAtPrice ? { compareAtPrice: p.compareAtPrice } : {}),
      description: makeBlock(`${p.name} — a premium quality product crafted with care. Perfect for everyday use with exceptional durability and style.`),
      images: [image],
      category: { _type: "reference", _ref: catIdMap[p.category] },
      tags: p.tags,
      variants: makeVariants(p),
      featured: p.featured,
      inStock: true,
      weight: Math.floor(Math.random() * 800) + 200,
    });
    console.log(`  ✓ ${p.name} ($${(p.price / 100).toFixed(2)})`);
  }

  console.log("\n✅ Seed complete! 5 categories and 15 products created.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
