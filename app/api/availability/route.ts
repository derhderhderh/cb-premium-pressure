import { NextResponse } from "next/server"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore/lite"
import { DEFAULT_WORKER_AVAILABILITY, normalizeAvailability } from "@/lib/availability"

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
    const workersQuery = query(
      collection(db, "users"),
      where("role", "==", "worker"),
      where("active", "==", true)
    )
    const snapshot = await getDocs(workersQuery)
    const days = new Set<number>()

    snapshot.docs.forEach((doc) => {
      normalizeAvailability(doc.data().availability as number[] | undefined).forEach((day) =>
        days.add(day)
      )
    })

    return NextResponse.json({
      availableWeekdays: normalizeAvailability(
        snapshot.empty ? DEFAULT_WORKER_AVAILABILITY : Array.from(days)
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
