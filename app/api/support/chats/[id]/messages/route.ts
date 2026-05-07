import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite"
import {
  addAiReplyIfNeeded,
  addSupportMessage,
  getChatMessages,
  notifyAdminsOfSupportChat,
  supportDb,
} from "../../../_shared"
import { SupportChat } from "@/lib/types"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const message = String(body.message || "").trim()
    const sender = body.sender === "admin" ? "admin" : "customer"

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const chatRef = doc(supportDb, "supportChats", id)
    const chatDoc = await getDoc(chatRef)

    if (!chatDoc.exists()) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const chat = { id: chatDoc.id, ...chatDoc.data() } as SupportChat

    if (sender === "admin") {
      const adminId = String(body.senderId || "")
      const canReply =
        !chat.claimedBy ||
        chat.claimedBy === adminId ||
        chat.allowedAdminIds.includes(adminId)

      if (!canReply) {
        return NextResponse.json(
          { error: "This chat is claimed by another admin." },
          { status: 403 }
        )
      }
    }

    await addSupportMessage({
      chatId: id,
      sender,
      senderId: body.senderId || null,
      senderName: String(body.senderName || (sender === "admin" ? "Admin" : "Customer")),
      body: message,
    })

    let needsAdmin = chat.needsAdmin
    if (sender === "customer" && !chat.claimedBy) {
      const aiReply = await addAiReplyIfNeeded(chat, message)
      needsAdmin = aiReply.needsAdmin || needsAdmin
      if (aiReply.needsAdmin && !chat.adminNotificationSent) {
        await notifyAdminsOfSupportChat(chat)
      }
    }

    await updateDoc(chatRef, {
      needsAdmin,
      adminNotificationSent: chat.adminNotificationSent || needsAdmin,
      updatedAt: serverTimestamp(),
    })

    const messages = await getChatMessages(id)

    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error("Failed to send support message:", error)
    return NextResponse.json({ error: "Failed to send support message" }, { status: 500 })
  }
}
