import { NextRequest, NextResponse } from "next/server"
import { sendBookingConfirmation, sendStatusUpdateEmail } from "@/lib/email"
import { Booking } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, booking, newStatus } = body

    if (!booking) {
      return NextResponse.json(
        { error: "Booking data is required" },
        { status: 400 }
      )
    }

    switch (type) {
      case "booking_confirmation":
        await sendBookingConfirmation(booking as Booking)
        break
      case "status_update":
        if (!newStatus) {
          return NextResponse.json(
            { error: "New status is required for status updates" },
            { status: 400 }
          )
        }
        await sendStatusUpdateEmail(booking as Booking, newStatus)
        break
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
