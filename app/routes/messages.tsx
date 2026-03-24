import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  CheckCheck,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  name: string
  title: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
}

interface Message {
  id: string
  sender: "me" | "other"
  content: string
  time: string
  status: "sent" | "delivered" | "read"
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Somsak Phommavong",
    title: "Senior Full-Stack Developer",
    lastMessage: "Looking forward to our session tomorrow!",
    time: "2h ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Keo Bounyavong",
    title: "Mobile App Developer",
    lastMessage: "I can help with your React Native project",
    time: "5h ago",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Thongchanh Sisouphon",
    title: "DevOps Engineer",
    lastMessage: "The AWS setup is complete. Let me know if you need anything else.",
    time: "1d ago",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Vanida Keomany",
    title: "UI/UX Designer",
    lastMessage: "Here are the mockups you requested",
    time: "2d ago",
    unread: 1,
    online: false,
  },
]

const messagesData: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      sender: "other",
      content: "Hi! I saw your booking for tomorrow. Looking forward to discussing your project.",
      time: "10:30 AM",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      content: "Hi Somsak! Yes, I am excited to discuss the e-commerce platform I am planning to build.",
      time: "10:35 AM",
      status: "read",
    },
    {
      id: "3",
      sender: "other",
      content: "Great! Could you share some details about the tech stack you are considering?",
      time: "10:40 AM",
      status: "read",
    },
    {
      id: "4",
      sender: "me",
      content: "I am thinking Next.js for the frontend, maybe Node.js or Python for the backend. What do you recommend?",
      time: "10:45 AM",
      status: "read",
    },
    {
      id: "5",
      sender: "other",
      content: "Next.js is a solid choice! For the backend, it depends on your requirements. We can discuss the pros and cons of each in our session.",
      time: "10:50 AM",
      status: "read",
    },
    {
      id: "6",
      sender: "other",
      content: "Looking forward to our session tomorrow!",
      time: "11:00 AM",
      status: "delivered",
    },
  ],
  "2": [
    {
      id: "1",
      sender: "other",
      content: "Hi there! I noticed you posted about needing help with a React Native app.",
      time: "Yesterday",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      content: "Yes! I need to build an ordering app for my restaurant business.",
      time: "Yesterday",
      status: "read",
    },
    {
      id: "3",
      sender: "other",
      content: "I can help with your React Native project. I have experience building similar apps with payment integration.",
      time: "5h ago",
      status: "read",
    },
  ],
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
  const [messages, setMessages] = useState<Message[]>(messagesData["1"])
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
    setMessages(messagesData[id] || [])
    setShowMobileChat(true)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "me",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navigation />

      <div className="flex flex-1 pt-16">
        {/* Conversations List */}
        <div
          className={cn(
            "w-full flex-col border-r border-border bg-card md:flex md:w-80 lg:w-96",
            showMobileChat ? "hidden" : "flex"
          )}
        >
          {/* Header */}
          <div className="border-b border-border p-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary",
                    selectedConversation === conv.id && "bg-secondary"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conv.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-semibold">{conv.name}</p>
                      <span className="text-xs text-white">{conv.time}</span>
                    </div>
                    <p className="truncate text-sm text-white">{conv.title}</p>
                    <p className="mt-1 truncate text-sm text-white">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex flex-1 flex-col",
            !showMobileChat && "hidden md:flex"
          )}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedConv.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConv.name}</p>
                    <p className="text-sm text-white">
                      {selectedConv.online ? (
                        <span className="text-emerald-500">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "me" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-xs",
                            message.sender === "me"
                              ? "text-primary-foreground/70"
                              : "text-white"
                          )}
                        >
                          <span>{message.time}</span>
                          {message.sender === "me" && (
                            <>
                              {message.status === "sent" && <Clock className="h-3 w-3" />}
                              {message.status === "delivered" && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                              {message.status === "read" && (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border bg-card p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-white">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
