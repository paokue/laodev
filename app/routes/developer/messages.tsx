import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Calendar,
  MessageSquare,
  FileText,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Home,
  Users,
  Check,
  CheckCheck,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const conversations = [
  {
    id: "1",
    name: "Khamla Sisavath",
    type: "Client",
    lastMessage: "Thank you! I'll review the changes.",
    time: "1h ago",
    unread: 1,
    isOnline: true,
    avatar: "KS",
  },
  {
    id: "2",
    name: "Bounmy Phanthavong",
    type: "Client",
    lastMessage: "Can we reschedule to 3pm?",
    time: "3h ago",
    unread: 2,
    isOnline: false,
    avatar: "BP",
  },
  {
    id: "3",
    name: "Vilay Souvannaphoum",
    type: "Client",
    lastMessage: "The consultation was very helpful!",
    time: "1d ago",
    unread: 0,
    isOnline: true,
    avatar: "VS",
  },
  {
    id: "4",
    name: "Souksamay Keomany",
    type: "Client",
    lastMessage: "See you tomorrow!",
    time: "2d ago",
    unread: 0,
    isOnline: false,
    avatar: "SK",
  },
]

const messages = [
  {
    id: "1",
    senderId: "user",
    text: "Hi! I have a React project that needs some optimization and code review.",
    time: "Yesterday, 2:45 PM",
    status: "read",
  },
  {
    id: "2",
    senderId: "developer",
    text: "Great! Could you share some details about your project? What specific areas would you like me to focus on?",
    time: "Yesterday, 3:00 PM",
    status: "read",
  },
  {
    id: "3",
    senderId: "user",
    text: "The main issues are performance with large lists and state management. I'm currently using Redux but considering switching to React Query.",
    time: "Yesterday, 3:15 PM",
    status: "read",
  },
  {
    id: "4",
    senderId: "developer",
    text: "Those are common challenges. React Query is excellent for server state management. For list performance, we can look at virtualization options.",
    time: "Yesterday, 3:30 PM",
    status: "read",
  },
  {
    id: "5",
    senderId: "user",
    text: "Thank you! I'll review the changes and prepare questions for our session.",
    time: "1h ago",
    status: "delivered",
  },
]

export default function DeveloperMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setNewMessage("")
  }

  const handleSelectConversation = (conv: typeof conversations[0]) => {
    setSelectedConversation(conv)
    setShowMobileChat(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName="Somsak Phommavong"
      />

      <main className="pb-20 pt-16 md:pb-0 md:pt-16">
        <div className="mx-auto h-[calc(100vh-4rem-5rem)] max-w-7xl md:h-[calc(100vh-4rem)] md:px-4 md:py-6 lg:px-8">
          <Card className="flex h-full overflow-hidden rounded-none border-0 md:rounded-xl md:border">
            {/* Conversations List */}
            <div
              className={cn(
                "flex w-full flex-col border-r border-border md:w-80 lg:w-96",
                showMobileChat && "hidden md:flex"
              )}
            >
              {/* Header */}
              <div className="border-b border-border p-4">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-b border-border p-4 transition-colors hover:bg-secondary/50",
                      selectedConversation.id === conv.id && "bg-secondary/50"
                    )}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarFallback className="bg-blue-500/10 text-blue-400">
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{conv.name}</span>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.type}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={cn(
                "flex flex-1 flex-col",
                !showMobileChat && "hidden md:flex"
              )}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-blue-500/10 text-blue-400">
                        {selectedConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.isOnline ? (
                        <span className="text-emerald-400">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.senderId === "developer" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          message.senderId === "developer"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-[10px]",
                            message.senderId === "developer"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>{message.time.split(", ")[1]}</span>
                          {message.senderId === "developer" && (
                            message.status === "read" ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}
