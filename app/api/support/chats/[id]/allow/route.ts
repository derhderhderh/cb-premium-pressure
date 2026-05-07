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
    const allowedAdminId = String(body.allowedAdminId || "")
    const allowedAdminName = String(body.allowedAdminName || "Another admin")

    if (!adminId || !allowedAdminId) {
      return NextResponse.json({ error: "Admin ids are required" }, { status: 400 })
    }

    const chatRef = doc(supportDb, "supportChats", id)
    const chatDoc = await getDoc(chatRef)
    if (!chatDoc.exists()) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const chat = { id: chatDoc.id, ...chatDoc.data() } as SupportChat
    if (chat.claimedBy !== adminId) {
      return NextResponse.json(
        { error: "Only the claiming admin can allow another admin." },
        { status: 403 }
      )
    }

    const allowedAdminIds = Array.from(new Set([...chat.allowedAdminIds, allowedAdminId]))
    await updateDoc(chatRef, {
      allowedAdminIds,
      updatedAt: serverTimestamp(),
    })
    await addSupportMessage({
      chatId: id,
      sender: "system",
      senderName: "System",
      body: `${allowedAdminName} can now reply in this chat.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to allow admin:", error)
    return NextResponse.json({ error: "Failed to allow admin" }, { status: 500 })
  }
}
