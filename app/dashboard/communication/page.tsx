"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, Users, Plus, Search, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function CommunicationPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvTitle, setNewConvTitle] = useState("")
  const [newConvType, setNewConvType] = useState("PUBLIC")
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("conversations")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    loadUsers()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (selectedConv) {
      loadMessages()
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConv])

  const loadUsers = async () => {
    try {
      const data = await apiClient.get<any[]>("/communication/users")
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur lors du chargement des utilisateurs", variant: "destructive" })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }

  const startPrivateConversation = async (userId: string) => {
    try {
      const conversation = await apiClient.post("/communication/conversations/private", { userId })
      setSelectedConv(conversation)
      setActiveTab("conversations")
      await loadConversations()
      await loadMessages()
      toast({ title: "Conversation ouverte" })
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur lors de l'ouverture de la conversation", variant: "destructive" })
    }
  }

  const loadConversations = async () => {
    try {
      const data = await apiClient.get<any[]>("/communication/conversations")
      console.log('📋 Conversations chargées:', data)
      setConversations(data)
    } catch (err) {
      console.error('❌ Erreur chargement conversations:', err)
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
    if (!newConvTitle.trim()) {
      toast({ title: "Le titre est requis", variant: "destructive" })
      return
    }
    try {
      const payload = {
        title: newConvTitle,
        type: newConvType,
        participantIds: ""
      }
      console.log('📤 Création conversation:', payload)
      const result = await apiClient.post("/communication/conversations", payload)
      console.log('✅ Conversation créée:', result)
      toast({ title: "Conversation créée" })
      setShowNewConv(false)
      setNewConvTitle("")
      await loadConversations()
    } catch (err) {
      console.error('❌ Erreur création:', err)
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

  useEffect(() => {
    console.log("Current user:", { email: user?.email, userId: user?.userId })
    console.log("Messages senderIds:", messages.map(m => m.senderId))
    if (messages.length > 0) {
      console.log("First message senderId:", messages[0].senderId, "Type:", typeof messages[0].senderId)
    }
  }, [messages, user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication</h1>
          <p className="text-muted-foreground">Conversations et messages</p>
        </div>
        {user?.roles?.includes("ADMIN") && (
          <Button onClick={() => setShowNewConv(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Messagerie</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversations">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Conversations
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversations" className="space-y-2 mt-4">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune conversation
                  </p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConv?.id === conv.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">{conv.title}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.messageCount} messages
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="users" className="space-y-2 mt-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => startPrivateConversation(u.id)}
                      className="p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        {u.roles && Array.isArray(u.roles) && (
                          <div className="flex gap-1 mt-1">
                            {u.roles.map((role: any) => (
                              <Badge key={typeof role === 'string' ? role : role.name} variant="secondary" className="text-xs">
                                {typeof role === 'string' ? role : role.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
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
                <div className="h-96 overflow-y-auto space-y-2 p-4 bg-muted/20 rounded-lg">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.senderId === user?.email
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] sm:max-w-[70%] md:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm ${
                              isCurrentUser
                                ? "bg-blue-500 text-white rounded-br-sm"
                                : "bg-white text-gray-900 rounded-bl-sm"
                            }`}
                          >
                            {!isCurrentUser && (
                              <p className="text-xs font-semibold mb-1 opacity-80">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${
                              isCurrentUser ? "text-blue-100" : "text-gray-500"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
    </div>
  )
}
