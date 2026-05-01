import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FirestoreDate, ServiceType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDate(value: FirestoreDate): Date {
  return value instanceof Date ? value : value.toDate()
}

export function getQuantityLabel(serviceType: ServiceType): string {
  return serviceType === "trashcan" ? "Number of Cans" : "Square Footage"
}

export function getQuantityUnit(serviceType: ServiceType): string {
  return serviceType === "trashcan" ? "cans" : "sq ft"
}

export function formatBookingQuantity(
  serviceType: ServiceType,
  quantity: number
): string {
  const unit = getQuantityUnit(serviceType)
  const formatted = quantity.toLocaleString()

  if (serviceType === "trashcan" && quantity === 1) {
    return "1 can"
  }

  return `${formatted} ${unit}`
}
