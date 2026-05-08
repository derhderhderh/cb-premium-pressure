import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore/lite"
import { sendSupportChatLinkEmail } from "@/lib/email"
import {
  addAiReplyIfNeeded,
  addSupportMessage,
  getSiteUrl,
  notifyAdminsOfSupportChat,
  supportDb,
} from "../_shared"
import { SupportChat } from "@/lib/types"

export const runtime = "nodejs"

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return new Resend(process.env.RESEND_API_KEY)
}

function extractEmailAddress(value: string) {
  return value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || value
}

function extractName(value: string) {
  const email = extractEmailAddress(value)
  return value
    .replace(email, "")
    .replace(/[<>"]/g, "")
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as {
      type?: string
      data?: {
        email_id?: string
        from?: string
        subject?: string
      }
    }

    if (event.type !== "email.received" || !event.data?.email_id) {
      return NextResponse.json({ ignored: true })
    }

    const { data: receivedEmail, error } = await getResend().emails.receiving.get(
      event.data.email_id
    )

    if (error || !receivedEmail) {
      throw new Error("Failed to retrieve received email content.")
    }

    const from = receivedEmail.from || event.data.from || ""
    const fromEmail = extractEmailAddress(from)
    const fromName = extractName(from)
    const subject = receivedEmail.subject || event.data.subject || "Email support request"
    const text = String(receivedEmail.text || receivedEmail.html || "").trim()

    if (!fromEmail || !text) {
      return NextResponse.json(
        { error: "Inbound email must include sender and message text." },
        { status: 400 }
      )
    }

    const chatDoc = await addDoc(collection(supportDb, "supportChats"), {
      customerName: fromName,
      customerEmail: fromEmail,
      customerPhone: "",
      subject,
      source: "email",
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
      customerName: fromName,
      customerEmail: fromEmail,
      customerPhone: "",
      subject,
      source: "email",
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
      senderName: fromName || fromEmail,
      body: text,
    })

    const aiReply = await addAiReplyIfNeeded(chat, text)
    await notifyAdminsOfSupportChat(chat)

    await updateDoc(doc(supportDb, "supportChats", chatDoc.id), {
      needsAdmin: aiReply.needsAdmin,
      adminNotificationSent: true,
      updatedAt: serverTimestamp(),
    })

    await sendSupportChatLinkEmail({
      to: fromEmail,
      chatUrl: `${getSiteUrl()}/chat/${chatDoc.id}`,
      subject,
    })

    return NextResponse.json({ success: true, chatId: chatDoc.id })
  } catch (error) {
    console.error("Failed to process inbound support email:", error)
    return NextResponse.json(
      { error: "Failed to process inbound support email" },
      { status: 500 }
    )
  }
}
