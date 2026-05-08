import type { Booking, BookingServiceItem, ServiceType } from "./types";
import { SERVICE_LABELS } from "./types";
import { formatBookingQuantity } from "./utils";

export function normalizeBookingServices(input: unknown): BookingServiceItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const service = item as Partial<BookingServiceItem>;
      if (!service.serviceType || !(service.serviceType in SERVICE_LABELS)) return null;

      return {
        serviceType: service.serviceType as ServiceType,
        quantity: Number(service.quantity) || 0,
        estimatedPrice: Number(service.estimatedPrice) || 0,
      };
    })
    .filter(
      (item): item is BookingServiceItem =>
        item !== null && item.quantity > 0
    );
}

export function getBookingServices(booking: Booking): BookingServiceItem[] {
  const services = normalizeBookingServices(booking.services);
  if (services.length > 0) return services;

  return [
    {
      serviceType: booking.serviceType,
      quantity: booking.squareFootage,
      estimatedPrice: booking.estimatedPrice,
    },
  ];
}

export function formatBookingServices(booking: Booking) {
  return getBookingServices(booking)
    .map((service) => SERVICE_LABELS[service.serviceType])
    .join(", ");
}

export function formatBookingServiceDetails(booking: Booking) {
  return getBookingServices(booking)
    .map(
      (service) =>
        `${SERVICE_LABELS[service.serviceType]} (${formatBookingQuantity(
          service.serviceType,
          service.quantity
        )})`
    )
    .join(", ");
}
