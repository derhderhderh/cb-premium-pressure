import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore/lite"
import { getChatMessages, supportDb } from "../../_shared"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const chatDoc = await getDoc(doc(supportDb, "supportChats", id))

    if (!chatDoc.exists()) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const messages = await getChatMessages(id)

    return NextResponse.json({
      chat: { id: chatDoc.id, ...chatDoc.data() },
      messages,
    })
  } catch (error) {
    console.error("Failed to load support chat:", error)
    return NextResponse.json({ error: "Failed to load support chat" }, { status: 500 })
  }
}
