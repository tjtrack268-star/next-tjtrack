"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageSquare, Users, Send, Plus, Globe, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function AdminCommunicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvTitle, setNewConvTitle] = useState("")
  const [newConvType, setNewConvType] = useState("PUBLIC")

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      loadMessages()
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConv])

  const loadConversations = async () => {
    try {
      const data = await apiClient.get<any[]>("/communication/conversations")
      setConversations(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadMessages = async () => {
    if (!selectedConv) return
    try {
      const data = await apiClient.get<any[]>(`/communication/conversations/${selectedConv.id}/messages`)
      setMessages(data)
    } catch (err) {
      console.error(err)
    }
  }

  const createConversation = async () => {
    try {
      await apiClient.post("/communication/conversations", {
        title: newConvTitle,
        type: newConvType,
        participantIds: ""
      })
      toast({ title: "Conversation créée" })
      setShowNewConv(false)
      setNewConvTitle("")
      loadConversations()
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return
    try {
      await apiClient.post(`/communication/conversations/${selectedConv.id}/messages`, {
        content: newMessage
      })
      setNewMessage("")
      loadMessages()
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication</h1>
          <p className="text-muted-foreground">Conversations privées et publiques</p>
        </div>
        <Button onClick={() => setShowNewConv(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConv?.id === conv.id ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  {conv.type === "PUBLIC" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <span className="font-medium">{conv.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conv.messageCount} messages
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConv ? selectedConv.title : "Sélectionnez une conversation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConv ? (
              <div className="space-y-4">
                <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === user?.userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user?.userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre message..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={newConvTitle}
                onChange={(e) => setNewConvTitle(e.target.value)}
                placeholder="Titre de la conversation"
              />
            </div>
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={newConvType === "PUBLIC" ? "default" : "outline"}
                  onClick={() => setNewConvType("PUBLIC")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Public
                </Button>
                <Button
                  variant={newConvType === "PRIVATE" ? "default" : "outline"}
                  onClick={() => setNewConvType("PRIVATE")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Privé
                </Button>
              </div>
            </div>
            <Button onClick={createConversation} className="w-full">
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}