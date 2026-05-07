import { NextRequest, NextResponse } from "next/server"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore/lite"
import {
  addAiReplyIfNeeded,
  addSupportMessage,
  getChatMessages,
  notifyAdminsOfSupportChat,
  supportDb,
} from "../_shared"
import { SupportChat } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  try {
    const chatsQuery = query(
      collection(supportDb, "supportChats"),
      orderBy("updatedAt", "desc")
    )
    const snapshot = await getDocs(chatsQuery)
    const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Failed to load support chats:", error)
    return NextResponse.json({ error: "Failed to load support chats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = String(body.message || "").trim()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const chatDoc = await addDoc(collection(supportDb, "supportChats"), {
      customerName: String(body.customerName || "").trim(),
      customerEmail: String(body.customerEmail || "").trim(),
      customerPhone: String(body.customerPhone || "").trim(),
      subject: String(body.subject || "Website chat").trim(),
      source: body.source === "email" ? "email" : "website",
      status: "open",
      claimedBy: null,
      allowedAdminIds: [],
      adminNotificationSent: false,
      needsAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const chat = {
      id: chatDoc.id,
      customerName: String(body.customerName || "").trim(),
      customerEmail: String(body.customerEmail || "").trim(),
      customerPhone: String(body.customerPhone || "").trim(),
      subject: String(body.subject || "Website chat").trim(),
      source: body.source === "email" ? "email" : "website",
      status: "open",
      claimedBy: null,
      allowedAdminIds: [],
      adminNotificationSent: false,
      needsAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SupportChat

    await addSupportMessage({
      chatId: chatDoc.id,
      sender: "customer",
      senderName: chat.customerName || "Customer",
      body: message,
    })

    const aiReply = await addAiReplyIfNeeded(chat, message)
    await notifyAdminsOfSupportChat(chat)

    await updateDoc(doc(supportDb, "supportChats", chatDoc.id), {
      needsAdmin: aiReply.needsAdmin,
      adminNotificationSent: true,
      updatedAt: serverTimestamp(),
    })

    const messages = await getChatMessages(chatDoc.id)

    return NextResponse.json({
      chat: { ...chat, needsAdmin: aiReply.needsAdmin, adminNotificationSent: true },
      messages,
    })
  } catch (error) {
    console.error("Failed to create support chat:", error)
    return NextResponse.json({ error: "Failed to create support chat" }, { status: 500 })
  }
}
