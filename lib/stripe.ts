import Stripe from "stripe";

let _stripe: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    }
    const value = (_stripe as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(_stripe) : value;
  },
});

export function formatAmountForStripe(amount: number): number {
  // amount is already in cents
  return Math.round(amount);
}

export function formatAmountFromStripe(amount: number): number {
  return amount;
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}
