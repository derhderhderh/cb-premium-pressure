import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FirestoreDate } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDate(value: FirestoreDate): Date {
  return value instanceof Date ? value : value.toDate()
}
