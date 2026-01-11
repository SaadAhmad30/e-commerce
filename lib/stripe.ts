import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
