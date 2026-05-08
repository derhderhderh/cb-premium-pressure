import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore/lite"
import { Booking, SERVICE_LABELS, ServiceType } from "@/lib/types"
import { sendBookingConfirmation, sendNewBookingAdminEmail } from "@/lib/email"
import { formatDateKey, normalizeAvailableDates } from "@/lib/availability"
import { normalizeBookingServices } from "@/lib/booking-services"

export const runtime = "nodejs"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([
    promise,
    timeout,
  ]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
}

function getConfiguredAdminEmails() {
  return (process.env.ADMIN_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
}

async function getAdminNotificationEmails() {
  const emails = new Set(getConfiguredAdminEmails())

  try {
    const adminsQuery = query(
      collection(db, "users"),
      where("role", "==", "admin"),
      where("active", "==", true)
    )
    const snapshot = await withTimeout(
      getDocs(adminsQuery),
      5000,
      "Timed out while loading admin notification recipients"
    )

    snapshot.docs.forEach((doc) => {
      const email = doc.data().email
      if (typeof email === "string" && email) {
        emails.add(email)
      }
    })
  } catch (error) {
    console.error("Failed to load admin notification recipients:", error)
  }

  return Array.from(emails)
}

async function getAvailableBookingDates() {
  const settingsDoc = await withTimeout(
    getDoc(doc(db, "settings", "global")),
    5000,
    "Timed out while loading booking availability"
  )
  return normalizeAvailableDates(
    settingsDoc.exists()
      ? (settingsDoc.data().availableBookingDates as string[] | undefined)
      : undefined
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      email,
      phone,
      address,
      serviceType,
      squareFootage,
      estimatedPrice,
      services,
      preferredDate,
      preferredTime,
      notes,
    } = body

    // Validate required fields
    if (!customerName || !email || !phone || !address || !serviceType || !squareFootage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!(serviceType in SERVICE_LABELS)) {
      return NextResponse.json(
        { error: "That service is no longer available for booking." },
        { status: 400 }
      )
    }

    const requestedDate = preferredDate ? new Date(preferredDate) : null
    if (!requestedDate || Number.isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: "Please choose a valid preferred date" },
        { status: 400 }
      )
    }

    const availableDates = await getAvailableBookingDates()
    if (!availableDates.includes(formatDateKey(requestedDate))) {
      return NextResponse.json(
        { error: "That date is not available for booking. Please choose an available date." },
        { status: 400 }
      )
    }

    const requestedServices = normalizeBookingServices(services)
    const bookingServices =
      requestedServices.length > 0
        ? requestedServices
        : [
            {
              serviceType: serviceType as ServiceType,
              quantity: Number(squareFootage),
              estimatedPrice: Number(estimatedPrice),
            },
          ]

    // Create booking document
    const bookingData: Omit<Booking, "id"> = {
      customerName,
      email,
      phone,
      address,
      serviceType: serviceType as ServiceType,
      services: bookingServices,
      squareFootage: bookingServices[0]?.quantity || Number(squareFootage),
      estimatedPrice: Number(estimatedPrice),
      preferredDate: requestedDate,
      preferredTime: preferredTime || "",
      notes: notes || "",
      status: "pending",
      assignedWorker: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to Firestore
    const docRef = await withTimeout(
      addDoc(collection(db, "bookings"), {
        ...bookingData,
        preferredDate: bookingData.preferredDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      15000,
      "Timed out while saving booking"
    )

    // Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const savedBooking = {
          ...bookingData,
          id: docRef.id,
        }
        const adminEmails = await getAdminNotificationEmails()

        await withTimeout(
          Promise.all([
            sendBookingConfirmation(savedBooking),
            adminEmails.length > 0
              ? sendNewBookingAdminEmail(savedBooking, adminEmails)
              : Promise.resolve(),
          ]),
          8000,
          "Timed out while sending booking emails"
        )
      } catch (emailError) {
        console.error("Failed to send booking email:", emailError)
        // Don't fail the booking if email fails
      }
    } else {
      console.warn("Skipping confirmation email: RESEND_API_KEY is not configured")
    }

    return NextResponse.json(
      { 
        success: true, 
        bookingId: docRef.id,
        message: "Booking created successfully" 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating booking:", error)

    const message = error instanceof Error ? error.message : "Unknown error"
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined

    return NextResponse.json(
      {
        error: "Failed to create booking",
        details: code ? `${code}: ${message}` : message,
      },
      { status: 500 }
    )
  }
}
