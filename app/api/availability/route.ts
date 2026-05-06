import { NextResponse } from "next/server"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore/lite"
import { DEFAULT_BOOKING_AVAILABILITY, normalizeAvailability } from "@/lib/availability"

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

export async function GET() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"))
    const configuredAvailability = settingsDoc.exists()
      ? (settingsDoc.data().bookingAvailability as number[] | undefined)
      : undefined

    return NextResponse.json({
      availableWeekdays: normalizeAvailability(
        configuredAvailability || DEFAULT_BOOKING_AVAILABILITY
      ),
    })
  } catch (error) {
    console.error("Failed to load availability:", error)

    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 }
    )
  }
}
