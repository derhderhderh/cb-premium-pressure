"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SupportChat, SupportMessage } from "@/lib/types"
import { Send } from "lucide-react"

export default function CustomerChatPage() {
  const params = useParams<{ id: string }>()
  const [chat, setChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const loadChat = async () => {
    const response = await fetch(`/api/support/chats/${params.id}`)
    if (!response.ok) {
      setError("Chat could not be loaded.")
      return
    }
    const data = await response.json()
    setChat(data.chat)
    setMessages(data.messages)
  }

  useEffect(() => {
    loadChat()
    const interval = window.setInterval(loadChat, 5000)
    return () => window.clearInterval(interval)
  }, [params.id])

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/support/chats/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "customer", message }),
      })
      if (!response.ok) throw new Error("Failed to send message")
      const data = await response.json()
      setMessages(data.messages)
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow bg-secondary/30 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>{chat?.subject || "Support Chat"}</CardTitle>
              <CardDescription>
                Our assistant may respond first while an admin reviews your request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="h-[420px] space-y-3 overflow-y-auto rounded-md border bg-background p-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={
                      item.sender === "customer"
                        ? "ml-auto max-w-[80%] rounded-md bg-primary p-3 text-primary-foreground"
                        : "max-w-[80%] rounded-md bg-muted p-3 text-foreground"
                    }
                  >
                    <p className="mb-1 text-xs opacity-70">{item.senderName}</p>
                    <p className="whitespace-pre-wrap text-sm">{item.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="space-y-3">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                />
                <Button type="submit" disabled={isSending || !message.trim()}>
                  {isSending ? "Sending..." : "Send"}
                  {!isSending && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
