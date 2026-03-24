import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Flag,
  CheckCircle2,
  MessageSquare,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

interface Message {
  id: string
  sender: string
  senderEmail: string
  senderType: "user" | "developer"
  receiver: string
  receiverEmail: string
  receiverType: "user" | "developer"
  preview: string
  fullMessage: string
  status: "active" | "flagged" | "resolved"
  messageCount: number
  lastActivity: string
  createdAt: string
  bookingId?: string
}

const messages: Message[] = [
  {
    id: "1",
    sender: "Bounmy Khamphouthong",
    senderEmail: "bounmy@email.com",
    senderType: "user",
    receiver: "Somsak Phommavong",
    receiverEmail: "somsak@email.com",
    receiverType: "developer",
    preview: "Hi, I wanted to discuss the code review session...",
    fullMessage: "Hi, I wanted to discuss the code review session we have scheduled for tomorrow. I have prepared all the code files and documentation. Could you please let me know if there's anything specific I should prepare?",
    status: "active",
    messageCount: 12,
    lastActivity: "5 mins ago",
    createdAt: "2024-03-20",
    bookingId: "BK-001",
  },
  {
    id: "2",
    sender: "Viengkham Thammavong",
    senderEmail: "viengkham@email.com",
    senderType: "user",
    receiver: "Keo Bounsavath",
    receiverEmail: "keo@email.com",
    receiverType: "developer",
    preview: "Thank you for the mentorship session yesterday...",
    fullMessage: "Thank you for the mentorship session yesterday. I learned a lot about machine learning concepts. Looking forward to our next session!",
    status: "active",
    messageCount: 8,
    lastActivity: "2 hours ago",
    createdAt: "2024-03-18",
    bookingId: "BK-002",
  },
  {
    id: "3",
    sender: "Spam User",
    senderEmail: "spam@email.com",
    senderType: "user",
    receiver: "Multiple Developers",
    receiverEmail: "various@email.com",
    receiverType: "developer",
    preview: "URGENT: Make money fast with this opportunity...",
    fullMessage: "URGENT: Make money fast with this opportunity... [Spam content removed]",
    status: "flagged",
    messageCount: 15,
    lastActivity: "1 day ago",
    createdAt: "2024-03-22",
  },
  {
    id: "4",
    sender: "Thongphet Vongsavath",
    senderEmail: "thongphet@email.com",
    senderType: "user",
    receiver: "Khamla Phommachan",
    receiverEmail: "khamla@email.com",
    receiverType: "developer",
    preview: "Great session! The career advice was very helpful...",
    fullMessage: "Great session! The career advice was very helpful. I now have a clear roadmap for my career development. Thank you!",
    status: "active",
    messageCount: 5,
    lastActivity: "3 hours ago",
    createdAt: "2024-03-21",
    bookingId: "BK-003",
  },
  {
    id: "5",
    sender: "Reported Conversation",
    senderEmail: "user@email.com",
    senderType: "user",
    receiver: "Developer Name",
    receiverEmail: "dev@email.com",
    receiverType: "developer",
    preview: "This conversation was reported for inappropriate content...",
    fullMessage: "[Content under review - reported for inappropriate behavior]",
    status: "flagged",
    messageCount: 20,
    lastActivity: "6 hours ago",
    createdAt: "2024-03-19",
  },
  {
    id: "6",
    sender: "Previous Issue",
    senderEmail: "resolved@email.com",
    senderType: "user",
    receiver: "Support Developer",
    receiverEmail: "support@email.com",
    receiverType: "developer",
    preview: "Issue has been resolved successfully...",
    fullMessage: "Issue has been resolved successfully. Thank you for your help!",
    status: "resolved",
    messageCount: 25,
    lastActivity: "2 days ago",
    createdAt: "2024-03-15",
  },
]

export default function AdminMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)

  const handleFlag = (id: string) => {
    setLocalMessages(
      localMessages.map((msg) =>
        msg.id === id ? { ...msg, status: "flagged" as const } : msg
      )
    )
  }

  const handleResolve = (id: string) => {
    setLocalMessages(
      localMessages.map((msg) =>
        msg.id === id ? { ...msg, status: "resolved" as const } : msg
      )
    )
  }

  const handleDelete = () => {
    if (selectedMessage) {
      setLocalMessages(localMessages.filter((msg) => msg.id !== selectedMessage.id))
      setShowDeleteDialog(false)
      setSelectedMessage(null)
    }
  }

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "flagged", label: "Flagged" },
        { value: "resolved", label: "Resolved" },
      ],
    },
    {
      key: "senderType",
      label: "Sender Type",
      options: [
        { value: "user", label: "User" },
        { value: "developer", label: "Developer" },
      ],
    },
  ]

  const getStatusBadge = (status: Message["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            Active
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            Flagged
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-white">
            Resolved
          </Badge>
        )
    }
  }

  const columns: Column<Message>[] = [
    {
      key: "sender",
      label: "Conversation",
      sortable: true,
      render: (msg) => (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">
                {msg.sender.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {msg.receiver.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{msg.sender}</span>
              <ArrowRight className="h-3 w-3 text-white" />
              <span className="font-medium">{msg.receiver}</span>
            </div>
            <p className="max-w-[300px] truncate text-sm text-white">
              {msg.preview}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "messageCount",
      label: "Messages",
      sortable: true,
      render: (msg) => (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-white" />
          {msg.messageCount}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (msg) => getStatusBadge(msg.status),
    },
    {
      key: "bookingId",
      label: "Booking",
      render: (msg) =>
        msg.bookingId ? (
          <Badge variant="secondary">{msg.bookingId}</Badge>
        ) : (
          <span className="text-white">-</span>
        ),
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      sortable: true,
      render: (msg) => (
        <div className="flex items-center gap-1 text-white">
          <Clock className="h-4 w-4" />
          {msg.lastActivity}
        </div>
      ),
    },
  ]

  const renderMobileCard = (msg: Message) => (
    <Card key={msg.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {msg.sender.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {msg.receiver.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-sm font-medium">{msg.sender}</p>
              <p className="text-xs text-white">to {msg.receiver}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedMessage(msg)}>
                <Eye className="mr-2 h-4 w-4" />
                View Conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {msg.status === "active" && (
                <DropdownMenuItem onClick={() => handleFlag(msg.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag Conversation
                </DropdownMenuItem>
              )}
              {msg.status === "flagged" && (
                <DropdownMenuItem onClick={() => handleResolve(msg.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Resolved
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedMessage(msg)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-white">
          {msg.preview}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge(msg.status)}
            {msg.bookingId && <Badge variant="secondary">{msg.bookingId}</Badge>}
          </div>
          <div className="flex items-center gap-3 text-sm text-white">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {msg.messageCount}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {msg.lastActivity}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Stats
  const totalConversations = localMessages.length
  const flaggedCount = localMessages.filter((m) => m.status === "flagged").length
  const activeCount = localMessages.filter((m) => m.status === "active").length

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-white">Monitor and moderate platform conversations</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white">Total Conversations</p>
                <p className="text-2xl font-bold">{totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-white">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Flagged</p>
                <p className="text-2xl font-bold">{flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={localMessages}
        columns={columns}
        searchKey="sender"
        searchPlaceholder="Search by sender name..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(msg) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedMessage(msg)}>
                <Eye className="mr-2 h-4 w-4" />
                View Conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {msg.status === "active" && (
                <DropdownMenuItem onClick={() => handleFlag(msg.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag Conversation
                </DropdownMenuItem>
              )}
              {msg.status === "flagged" && (
                <DropdownMenuItem onClick={() => handleResolve(msg.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Resolved
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedMessage(msg)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage && !showDeleteDialog} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>Conversation Details</DialogTitle>
                <DialogDescription>
                  Review conversation between users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarFallback>
                        {selectedMessage.sender.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedMessage.receiver.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium">{selectedMessage.sender}</p>
                    <p className="text-sm text-white">
                      to {selectedMessage.receiver}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {getStatusBadge(selectedMessage.status)}
                  {selectedMessage.bookingId && (
                    <Badge variant="secondary">{selectedMessage.bookingId}</Badge>
                  )}
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">{selectedMessage.fullMessage}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-white">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {selectedMessage.messageCount} messages
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last active {selectedMessage.lastActivity}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                {selectedMessage.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleFlag(selectedMessage.id)
                      setSelectedMessage(null)
                    }}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Flag Conversation
                  </Button>
                )}
                {selectedMessage.status === "flagged" && (
                  <Button
                    onClick={() => {
                      handleResolve(selectedMessage.id)
                      setSelectedMessage(null)
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Resolved
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will remove all messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
