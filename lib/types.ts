import { Timestamp } from "firebase/firestore";

export type FirestoreDate = Timestamp | Date;

export type ServiceType =
  | "driveway"
  | "deck"
  | "patio"
  | "sidewalk"
  | "trashcan"
  | "commercial";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed";

export type UserRole = "admin" | "worker";

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: ServiceType;
  squareFootage: number;
  preferredDate: FirestoreDate;
  preferredTime: string;
  estimatedPrice: number;
  status: BookingStatus;
  assignedWorker: string | null;
  notes: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: FirestoreDate;
  active: boolean;
}

export interface Pricing {
  id: string;
  serviceType: ServiceType;
  basePrice: number;
  pricePerSqFt: number;
  minPrice: number;
  description: string;
  updatedAt: FirestoreDate;
  updatedBy: string;
}

export interface BusinessSettings {
  id: "global";
  businessName: string;
  email: string;
  address: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  taxRate: number;
  bookingAvailability?: number[];
}

export type SupportChatStatus = "open" | "claimed" | "closed";
export type SupportChatSource = "website" | "email";
export type SupportMessageSender = "customer" | "admin" | "ai" | "system";

export interface SupportChat {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  source: SupportChatSource;
  status: SupportChatStatus;
  claimedBy: string | null;
  allowedAdminIds: string[];
  adminNotificationSent: boolean;
  needsAdmin: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface SupportMessage {
  id: string;
  chatId: string;
  sender: SupportMessageSender;
  senderId: string | null;
  senderName: string;
  body: string;
  createdAt: FirestoreDate;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  driveway: "Driveway Cleaning",
  deck: "Deck Cleaning",
  patio: "Patio Cleaning",
  sidewalk: "Sidewalk Cleaning",
  trashcan: "Trashcan Cleaning",
  commercial: "Commercial Property",
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  in_progress: "In Progress",
  completed: "Completed",
};

export const DEFAULT_PRICING: Record<
  ServiceType,
  { basePrice: number; pricePerSqFt: number; minPrice: number }
> = {
  driveway: { basePrice: 60, pricePerSqFt: 0.12, minPrice: 80 },
  deck: { basePrice: 80, pricePerSqFt: 0.15, minPrice: 100 },
  patio: { basePrice: 50, pricePerSqFt: 0.10, minPrice: 65 },
  sidewalk: { basePrice: 35, pricePerSqFt: 0.08, minPrice: 50 },
  trashcan: { basePrice: 0, pricePerSqFt: 20, minPrice: 20 },
  commercial: { basePrice: 175, pricePerSqFt: 0.15, minPrice: 250 },
};
