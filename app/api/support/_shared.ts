import { initializeApp, getApps, getApp } from "firebase/app"
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore/lite"
import { Booking, SupportChat } from "@/lib/types"
import { getSupportAiReply } from "@/lib/support-ai"
import { sendNewSupportChatAdminEmail } from "@/lib/email"
import { toDate } from "@/lib/utils"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const supportDb = getFirestore(app)

export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://www.cbpremiumpressure.org"

  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
}

export async function getAdminEmails() {
  const configuredEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
  const emails = new Set(configuredEmails)

  const adminsQuery = query(
    collection(supportDb, "users"),
    where("role", "==", "admin"),
    where("active", "==", true)
  )
  const snapshot = await getDocs(adminsQuery)
  snapshot.docs.forEach((doc) => {
    const email = doc.data().email
    if (typeof email === "string" && email) emails.add(email)
  })

  return Array.from(emails)
}

async function findMatchingBookings({
  customerEmail,
  customerPhone,
  message,
}: {
  customerEmail?: string
  customerPhone?: string
  message: string
}) {
  const matches = new Map<string, Booking>()
  const possibleEmails = Array.from(
    new Set([
      customerEmail,
      ...message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [],
    ].filter(Boolean) as string[])
  )
  const possiblePhone = customerPhone || message.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0]

  for (const email of possibleEmails) {
    const bookingsQuery = query(collection(supportDb, "bookings"), where("email", "==", email))
    const snapshot = await getDocs(bookingsQuery)
    snapshot.docs.forEach((doc) => matches.set(doc.id, { id: doc.id, ...doc.data() } as Booking))
  }

  if (possiblePhone) {
    const bookingsQuery = query(collection(supportDb, "bookings"), where("phone", "==", possiblePhone))
    const snapshot = await getDocs(bookingsQuery)
    snapshot.docs.forEach((doc) => matches.set(doc.id, { id: doc.id, ...doc.data() } as Booking))
  }

  return Array.from(matches.values()).sort((a, b) => {
    return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
  })
}

export async function addSupportMessage({
  chatId,
  sender,
  senderId = null,
  senderName,
  body,
}: {
  chatId: string
  sender: "customer" | "admin" | "ai" | "system"
  senderId?: string | null
  senderName: string
  body: string
}) {
  return addDoc(collection(supportDb, "supportChats", chatId, "messages"), {
    chatId,
    sender,
    senderId,
    senderName,
    body,
    createdAt: serverTimestamp(),
  })
}

export async function addAiReplyIfNeeded(chat: SupportChat, message: string) {
  const matchingBookings = await findMatchingBookings({
    customerEmail: chat.customerEmail,
    customerPhone: chat.customerPhone,
    message,
  })
  const reply = getSupportAiReply(message, matchingBookings)

  await addSupportMessage({
    chatId: chat.id,
    sender: "ai",
    senderName: "CB Premium Assistant",
    body: reply.body,
  })

  return reply
}

export async function notifyAdminsOfSupportChat(chat: SupportChat) {
  const recipients = await getAdminEmails()
  if (recipients.length === 0) return

  await sendNewSupportChatAdminEmail({
    recipients,
    chatUrl: `${getSiteUrl()}/dashboard/admin/chats`,
    subject: chat.subject || "Support request",
    customerLabel: chat.customerName || chat.customerEmail || "A website visitor",
  })
}

export async function getChatMessages(chatId: string) {
  const messagesQuery = query(
    collection(supportDb, "supportChats", chatId, "messages"),
    orderBy("createdAt", "asc")
  )
  const snapshot = await getDocs(messagesQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
