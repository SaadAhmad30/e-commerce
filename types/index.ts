export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

export interface Category {
  _id: string;
  _type: "category";
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
}

export interface ProductVariant {
  _key: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceAdjustment?: number;
}

export interface Product {
  _id: string;
  _type: "product";
  name: string;
  slug: { current: string };
  description: string;
  price: number;
  compareAtPrice?: number;
  images: SanityImage[];
  category: Category;
  tags?: string[];
  variants?: ProductVariant[];
  featured?: boolean;
  inStock: boolean;
  sku: string;
}

export interface CartItem {
  id: string; // productId + variantKey
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  variant?: {
    key: string;
    size?: string;
    color?: string;
    sku: string;
  };
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
}

export interface ShippingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "featured";
  q?: string;
  page?: string;
}
