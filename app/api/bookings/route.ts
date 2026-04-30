import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Booking, ServiceType } from "@/lib/types"
import { sendBookingConfirmation } from "@/lib/email"

export const runtime = "nodejs"

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

    // Create booking document
    const bookingData: Omit<Booking, "id"> = {
      customerName,
      email,
      phone,
      address,
      serviceType: serviceType as ServiceType,
      squareFootage: Number(squareFootage),
      estimatedPrice: Number(estimatedPrice),
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
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
        await withTimeout(
          sendBookingConfirmation({
            ...bookingData,
            id: docRef.id,
          }),
          8000,
          "Timed out while sending confirmation email"
        )
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
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