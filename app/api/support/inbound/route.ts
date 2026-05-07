import { NextRequest, NextResponse } from "next/server"
import { sendSupportChatLinkEmail } from "@/lib/email"
import { getSiteUrl } from "../_shared"

export const runtime = "nodejs"

function extractInboundEmail(body: Record<string, unknown>) {
  const from =
    (body.from as string | undefined) ||
    ((body.sender as { email?: string } | undefined)?.email) ||
    ((body.from as { email?: string } | undefined)?.email) ||
    ""
  const subject = String(body.subject || "Email support request")
  const text = String(body.text || body.textBody || body.html || body.body || "").trim()

  return { from, subject, text }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const { from, subject, text } = extractInboundEmail(body)

    if (!from || !text) {
      return NextResponse.json(
        { error: "Inbound email must include from and message text." },
        { status: 400 }
      )
    }

    const createResponse = await fetch(`${getSiteUrl()}/api/support/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "email",
        customerEmail: from,
        subject,
        message: text,
      }),
    })

    if (!createResponse.ok) {
      throw new Error("Failed to create support chat from inbound email.")
    }

    const data = await createResponse.json()
    const chatId = data.chat?.id
    const chatUrl = `${getSiteUrl()}/chat/${chatId}`

    await sendSupportChatLinkEmail({
      to: from,
      chatUrl,
      subject,
    })

    return NextResponse.json({ success: true, chatId })
  } catch (error) {
    console.error("Failed to process inbound support email:", error)
    return NextResponse.json(
      { error: "Failed to process inbound support email" },
      { status: 500 }
    )
  }
}
