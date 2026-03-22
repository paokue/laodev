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
  Ban,
  CheckCircle2,
  Mail,
  Calendar,
  MapPin,
  Trash2,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  type: "user" | "developer"
  status: "active" | "suspended" | "pending"
  location: string
  joinedAt: string
  lastActive: string
  bookings: number
  spent: number
}

const users: User[] = [
  {
    id: "1",
    name: "Bounmy Khamphouthong",
    email: "bounmy@email.com",
    type: "user",
    status: "active",
    location: "Vientiane",
    joinedAt: "2024-01-15",
    lastActive: "2 hours ago",
    bookings: 5,
    spent: 225,
  },
  {
    id: "2",
    name: "Viengkham Thammavong",
    email: "viengkham@email.com",
    type: "user",
    status: "active",
    location: "Luang Prabang",
    joinedAt: "2024-02-20",
    lastActive: "1 day ago",
    bookings: 3,
    spent: 135,
  },
  {
    id: "3",
    name: "Manivanh Souphanthong",
    email: "manivanh@email.com",
    type: "user",
    status: "suspended",
    location: "Savannakhet",
    joinedAt: "2024-03-10",
    lastActive: "2 weeks ago",
    bookings: 1,
    spent: 45,
  },
  {
    id: "4",
    name: "Khamla Phommachan",
    email: "khamla@email.com",
    type: "developer",
    status: "active",
    location: "Vientiane",
    joinedAt: "2024-01-05",
    lastActive: "30 minutes ago",
    bookings: 0,
    spent: 0,
  },
  {
    id: "5",
    name: "Somphet Rattanavong",
    email: "somphet@email.com",
    type: "user",
    status: "pending",
    location: "Pakse",
    joinedAt: "2024-03-25",
    lastActive: "5 hours ago",
    bookings: 0,
    spent: 0,
  },
  {
    id: "6",
    name: "Thongphet Vongsavath",
    email: "thongphet@email.com",
    type: "user",
    status: "active",
    location: "Vientiane",
    joinedAt: "2024-02-01",
    lastActive: "3 hours ago",
    bookings: 8,
    spent: 360,
  },
  {
    id: "7",
    name: "Keo Bounsavath",
    email: "keo@email.com",
    type: "developer",
    status: "active",
    location: "Luang Prabang",
    joinedAt: "2024-01-20",
    lastActive: "1 hour ago",
    bookings: 0,
    spent: 0,
  },
  {
    id: "8",
    name: "Phouthone Keomany",
    email: "phouthone@email.com",
    type: "user",
    status: "active",
    location: "Vientiane",
    joinedAt: "2024-03-01",
    lastActive: "6 hours ago",
    bookings: 2,
    spent: 90,
  },
]

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [localUsers, setLocalUsers] = useState(users)

  const handleSuspend = (id: string) => {
    setLocalUsers(
      localUsers.map((user) =>
        user.id === id ? { ...user, status: "suspended" as const } : user
      )
    )
  }

  const handleActivate = (id: string) => {
    setLocalUsers(
      localUsers.map((user) =>
        user.id === id ? { ...user, status: "active" as const } : user
      )
    )
  }

  const handleDelete = () => {
    if (selectedUser) {
      setLocalUsers(localUsers.filter((user) => user.id !== selectedUser.id))
      setShowDeleteDialog(false)
      setSelectedUser(null)
    }
  }

  const filters: FilterOption[] = [
    {
      key: "type",
      label: "User Type",
      options: [
        { value: "user", label: "Normal User" },
        { value: "developer", label: "Developer" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "location",
      label: "Location",
      options: [
        { value: "Vientiane", label: "Vientiane" },
        { value: "Luang Prabang", label: "Luang Prabang" },
        { value: "Savannakhet", label: "Savannakhet" },
        { value: "Pakse", label: "Pakse" },
      ],
    },
  ]

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (user) => (
        <Badge variant={user.type === "developer" ? "default" : "secondary"}>
          {user.type === "developer" ? "Developer" : "User"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge
          variant="outline"
          className={
            user.status === "active"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
              : user.status === "suspended"
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {user.location}
        </div>
      ),
    },
    {
      key: "bookings",
      label: "Bookings",
      sortable: true,
      render: (user) => user.bookings,
    },
    {
      key: "spent",
      label: "Spent",
      sortable: true,
      render: (user) => (
        <span className="font-medium">{user.spent} Kip</span>
      ),
    },
    {
      key: "lastActive",
      label: "Last Active",
      render: (user) => (
        <span className="text-muted-foreground">{user.lastActive}</span>
      ),
    },
  ]

  const renderMobileCard = (user: User) => (
    <Card key={user.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === "active" ? (
                <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedUser(user)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={user.type === "developer" ? "default" : "secondary"}>
            {user.type === "developer" ? "Developer" : "User"}
          </Badge>
          <Badge
            variant="outline"
            className={
              user.status === "active"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                : user.status === "suspended"
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
            }
          >
            {user.status}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{user.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bookings</p>
            <p className="font-medium">{user.bookings}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Spent</p>
            <p className="font-medium">{user.spent} Kip</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Active</p>
            <p className="font-medium">{user.lastActive}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage all users and developers</p>
      </div>

      <DataTable
        data={localUsers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search users by name..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === "active" ? (
                <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedUser(user)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser && !showDeleteDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>View user information and activity</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                      {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant={selectedUser.type === "developer" ? "default" : "secondary"}>
                        {selectedUser.type === "developer" ? "Developer" : "User"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          selectedUser.status === "active"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                            : selectedUser.status === "suspended"
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
                        }
                      >
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {selectedUser.joinedAt}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{selectedUser.bookings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">{selectedUser.spent} Kip</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                {selectedUser.status === "active" ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleSuspend(selectedUser.id)
                      setSelectedUser(null)
                    }}
                  >
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleActivate(selectedUser.id)
                      setSelectedUser(null)
                    }}
                  >
                    Activate User
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
