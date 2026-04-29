import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore"
import { Booking } from "@/lib/types"
import { sendStatusUpdateEmail } from "@/lib/email"

// ✅ Firestore-safe update type
type BookingUpdate = {
  status?: string
  assignedWorker?: string | null
  updatedAt?: Timestamp | FieldValue
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, assignedWorker } = body

    const bookingRef = doc(db, "bookings", id)
    const bookingSnap = await getDoc(bookingRef)

    if (!bookingSnap.exists()) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    const updateData: BookingUpdate = {
      updatedAt: serverTimestamp(),
    }

    if (status) {
      updateData.status = status
    }

    if (assignedWorker !== undefined) {
      updateData.assignedWorker = assignedWorker
    }

    await updateDoc(bookingRef, updateData)

    // 📧 Send email if status changed
    if (status) {
      try {
        const bookingData = bookingSnap.data()

        const booking: Booking = {
          id,
          customerName: bookingData.customerName,
          email: bookingData.email,
          phone: bookingData.phone,
          address: bookingData.address,
          serviceType: bookingData.serviceType,
          squareFootage: bookingData.squareFootage,
          estimatedPrice: bookingData.estimatedPrice,
          preferredDate:
            bookingData.preferredDate?.toDate?.() ??
            new Date(bookingData.preferredDate),
          preferredTime: bookingData.preferredTime,
          notes: bookingData.notes,
          status,
          assignedWorker:
            assignedWorker ?? bookingData.assignedWorker,
          createdAt:
            bookingData.createdAt?.toDate?.() ?? new Date(),
          updatedAt: new Date(),
        }

        await sendStatusUpdateEmail(booking, status)
      } catch (emailError) {
        console.error("Email failed:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bookingRef = doc(db, "bookings", id)
    const bookingSnap = await getDoc(bookingRef)

    if (!bookingSnap.exists()) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    const data = bookingSnap.data()

    const booking: Booking = {
      id,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      serviceType: data.serviceType,
      squareFootage: data.squareFootage,
      estimatedPrice: data.estimatedPrice,
      preferredDate:
        data.preferredDate?.toDate?.() ??
        new Date(data.preferredDate),
      preferredTime: data.preferredTime,
      notes: data.notes,
      status: data.status,
      assignedWorker: data.assignedWorker,
      createdAt:
        data.createdAt?.toDate?.() ?? new Date(),
      updatedAt:
        data.updatedAt?.toDate?.() ?? new Date(),
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}