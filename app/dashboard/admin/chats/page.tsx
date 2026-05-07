"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { SupportChat, SupportMessage, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MessageCircle, Send, ShieldCheck } from "lucide-react"

export default function AdminChatsPage() {
  const { user, userProfile } = useAuth()
  const [chats, setChats] = useState<SupportChat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [admins, setAdmins] = useState<User[]>([])
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) || null,
    [chats, selectedChatId]
  )
  const canReply =
    selectedChat &&
    (!selectedChat.claimedBy ||
      selectedChat.claimedBy === user?.uid ||
      selectedChat.allowedAdminIds.includes(user?.uid || ""))
  const canGrantAccess = selectedChat?.claimedBy === user?.uid

  const loadChats = async () => {
    const response = await fetch("/api/support/chats")
    if (!response.ok) throw new Error("Failed to load chats")
    const data = await response.json()
    setChats(data.chats)
    if (!selectedChatId && data.chats.length > 0) {
      setSelectedChatId(data.chats[0].id)
    }
  }

  const loadSelectedChat = async (chatId: string) => {
    const response = await fetch(`/api/support/chats/${chatId}`)
    if (!response.ok) throw new Error("Failed to load chat")
    const data = await response.json()
    setMessages(data.messages)
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? data.chat : chat))
    )
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        await loadChats()
        const allUsers = await getAllUsers()
        setAdmins(allUsers.filter((item) => item.role === "admin" && item.active))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load support chats")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedChatId) return
    loadSelectedChat(selectedChatId).catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load chat")
    )
    const interval = window.setInterval(() => {
      loadSelectedChat(selectedChatId).catch(() => undefined)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [selectedChatId])

  const claimChat = async () => {
    if (!selectedChat || !user) return
    const response = await fetch(`/api/support/chats/${selectedChat.id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminId: user.uid,
        adminName: userProfile?.name || "Admin",
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error || "Failed to claim chat")
      return
    }

    await loadChats()
    await loadSelectedChat(selectedChat.id)
  }

  const allowAdmin = async (allowedAdminId: string) => {
    if (!selectedChat || !user) return
    const allowedAdmin = admins.find((admin) => admin.id === allowedAdminId)
    const response = await fetch(`/api/support/chats/${selectedChat.id}/allow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminId: user.uid,
        allowedAdminId,
        allowedAdminName: allowedAdmin?.name || "Another admin",
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error || "Failed to allow admin")
      return
    }

    await loadSelectedChat(selectedChat.id)
  }

  const sendReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedChat || !reply.trim() || !user || !canReply) return
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/support/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "admin",
          senderId: user.uid,
          senderName: userProfile?.name || "Admin",
          message: reply,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to send reply")
      }
      const data = await response.json()
      setMessages(data.messages)
      setReply("")
      await loadChats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply")
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support Chats</h1>
        <p className="text-muted-foreground">
          Claim support requests and chat directly with customers.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Queue
            </CardTitle>
            <CardDescription>{chats.length} chats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {chats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No support chats yet.</p>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors hover:bg-muted",
                    selectedChatId === chat.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{chat.subject || "Support chat"}</p>
                    <Badge variant={chat.claimedBy ? "secondary" : "default"}>
                      {chat.claimedBy ? "Claimed" : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {chat.customerName || chat.customerEmail || "Anonymous customer"}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{selectedChat?.subject || "Select a chat"}</CardTitle>
                <CardDescription>
                  {selectedChat
                    ? selectedChat.customerEmail || selectedChat.customerName || "Anonymous customer"
                    : "Choose a chat from the queue."}
                </CardDescription>
              </div>
              {selectedChat && (
                <div className="flex flex-wrap gap-2">
                  {!selectedChat.claimedBy && (
                    <Button onClick={claimChat}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Claim
                    </Button>
                  )}
                  {canGrantAccess && (
                    <Select onValueChange={allowAdmin}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Allow another admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins
                          .filter((admin) => admin.id !== user?.uid)
                          .map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[440px] space-y-3 overflow-y-auto rounded-md border bg-background p-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "max-w-[82%] rounded-md p-3",
                    item.sender === "admin"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : item.sender === "system"
                        ? "mx-auto bg-muted text-center text-muted-foreground"
                        : "bg-muted text-foreground"
                  )}
                >
                  <p className="mb-1 text-xs opacity-70">{item.senderName}</p>
                  <p className="whitespace-pre-wrap text-sm">{item.body}</p>
                </div>
              ))}
            </div>

            {selectedChat && !canReply && (
              <Alert>
                <AlertDescription>
                  This chat is read-only because another admin claimed it.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={sendReply} className="space-y-3">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={canReply ? "Type your reply..." : "Read-only"}
                disabled={!canReply}
                rows={3}
              />
              <Button type="submit" disabled={!canReply || isSending || !reply.trim()}>
                {isSending ? "Sending..." : "Send Reply"}
                {!isSending && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
