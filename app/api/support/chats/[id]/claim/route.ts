import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite"
import { addSupportMessage, supportDb } from "../../../_shared"
import { SupportChat } from "@/lib/types"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const adminId = String(body.adminId || "")
    const adminName = String(body.adminName || "Admin")

    if (!adminId) {
      return NextResponse.json({ error: "Admin id is required" }, { status: 400 })
    }

    const chatRef = doc(supportDb, "supportChats", id)
    const chatDoc = await getDoc(chatRef)
    if (!chatDoc.exists()) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const chat = { id: chatDoc.id, ...chatDoc.data() } as SupportChat
    if (chat.claimedBy && chat.claimedBy !== adminId) {
      return NextResponse.json({ error: "Chat is already claimed" }, { status: 409 })
    }

    await updateDoc(chatRef, {
      claimedBy: adminId,
      status: "claimed",
      updatedAt: serverTimestamp(),
    })
    await addSupportMessage({
      chatId: id,
      sender: "system",
      senderName: "System",
      body: `${adminName} claimed this chat.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to claim chat:", error)
    return NextResponse.json({ error: "Failed to claim chat" }, { status: 500 })
  }
}
