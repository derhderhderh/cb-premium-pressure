import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Booking, ServiceType } from "@/lib/types"
import { sendBookingConfirmation } from "@/lib/email"

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
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      preferredDate: bookingData.preferredDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Send confirmation email via Resend
    try {
      await sendBookingConfirmation({
        ...bookingData,
        id: docRef.id,
      })
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the booking if email fails
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
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}
