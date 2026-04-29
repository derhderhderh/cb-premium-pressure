import type { ServiceType, Pricing } from "./types";
import { DEFAULT_PRICING } from "./types";

export { DEFAULT_PRICING };

export function calculateQuote(
  serviceType: ServiceType,
  squareFootage: number,
  customPricing?: Pricing | null
): number {
  const pricing = customPricing
    ? {
        basePrice: customPricing.basePrice,
        pricePerSqFt: customPricing.pricePerSqFt,
        minPrice: customPricing.minPrice,
      }
    : DEFAULT_PRICING[serviceType];

  const calculatedPrice =
    pricing.basePrice + squareFootage * pricing.pricePerSqFt;

  // Return the higher of calculated price or minimum price
  return Math.max(calculatedPrice, pricing.minPrice);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
