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
import { Textarea } from "@/components/ui/textarea"
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react"

interface Developer {
  id: string
  name: string
  email: string
  title: string
  location: string
  skills: string[]
  experience: string
  hourlyRate: number
  bio: string
  appliedAt: string
  status: "pending" | "approved" | "rejected"
  bookings?: number
  rating?: number
}

const developers: Developer[] = [
  {
    id: "1",
    name: "Khamphanh Sengmany",
    email: "khamphanh@email.com",
    title: "Frontend Developer",
    location: "Vientiane",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    experience: "3-5",
    hourlyRate: 35,
    bio: "Passionate frontend developer with 4 years of experience building modern web applications.",
    appliedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: "2",
    name: "Vilay Southammavong",
    email: "vilay@email.com",
    title: "Data Scientist",
    location: "Luang Prabang",
    skills: ["Python", "TensorFlow", "Data Analysis", "Machine Learning"],
    experience: "5-7",
    hourlyRate: 50,
    bio: "Data scientist with expertise in machine learning and AI.",
    appliedAt: "5 hours ago",
    status: "pending",
  },
  {
    id: "3",
    name: "Chanthone Keobounphanh",
    email: "chanthone@email.com",
    title: "Backend Developer",
    location: "Savannakhet",
    skills: ["Node.js", "Python", "PostgreSQL", "Docker"],
    experience: "5-7",
    hourlyRate: 45,
    bio: "Experienced backend developer specializing in building scalable APIs.",
    appliedAt: "1 day ago",
    status: "pending",
  },
  {
    id: "4",
    name: "Somsak Phommavong",
    email: "somsak@email.com",
    title: "Senior Full-Stack Developer",
    location: "Vientiane",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    experience: "7-10",
    hourlyRate: 55,
    bio: "Full-stack developer with 8+ years of experience.",
    appliedAt: "1 week ago",
    status: "approved",
    bookings: 45,
    rating: 4.9,
  },
  {
    id: "5",
    name: "Keo Bounsavath",
    email: "keo@email.com",
    title: "Mobile Developer",
    location: "Luang Prabang",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    experience: "3-5",
    hourlyRate: 40,
    bio: "Mobile developer passionate about creating beautiful apps.",
    appliedAt: "2 weeks ago",
    status: "approved",
    bookings: 28,
    rating: 4.7,
  },
  {
    id: "6",
    name: "Rejected Developer",
    email: "rejected@email.com",
    title: "Junior Developer",
    location: "Pakse",
    skills: ["HTML", "CSS"],
    experience: "1-2",
    hourlyRate: 15,
    bio: "Beginner developer.",
    appliedAt: "2 weeks ago",
    status: "rejected",
  },
  {
    id: "7",
    name: "Khamla Phommachan",
    email: "khamla@email.com",
    title: "DevOps Engineer",
    location: "Vientiane",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    experience: "5-7",
    hourlyRate: 50,
    bio: "DevOps engineer helping teams deploy faster and more reliably.",
    appliedAt: "3 days ago",
    status: "approved",
    bookings: 15,
    rating: 4.8,
  },
]

export default function AdminDevelopersPage() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [localDevelopers, setLocalDevelopers] = useState(developers)

  const handleApprove = (id: string) => {
    setLocalDevelopers(
      localDevelopers.map((dev) =>
        dev.id === id ? { ...dev, status: "approved" as const, bookings: 0, rating: 0 } : dev
      )
    )
    setSelectedDeveloper(null)
  }

  const handleReject = () => {
    if (selectedDeveloper) {
      setLocalDevelopers(
        localDevelopers.map((dev) =>
          dev.id === selectedDeveloper.id ? { ...dev, status: "rejected" as const } : dev
        )
      )
      setShowRejectDialog(false)
      setSelectedDeveloper(null)
      setRejectReason("")
    }
  }

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
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
    {
      key: "experience",
      label: "Experience",
      options: [
        { value: "1-2", label: "1-2 years" },
        { value: "3-5", label: "3-5 years" },
        { value: "5-7", label: "5-7 years" },
        { value: "7-10", label: "7-10 years" },
      ],
    },
  ]

  const getStatusBadge = (status: Developer["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
    }
  }

  const columns: Column<Developer>[] = [
    {
      key: "name",
      label: "Developer",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {dev.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{dev.name}</p>
            <p className="text-sm text-white">{dev.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (dev) => (
        <span className="text-sm text-white">{dev.email}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4 text-white" />
          {dev.location}
        </div>
      ),
    },
    {
      key: "experience",
      label: "Experience",
      sortable: true,
      render: (dev) => (
        <div className="flex items-center gap-1 text-sm">
          <Briefcase className="h-4 w-4 text-white" />
          {dev.experience} yrs
        </div>
      ),
    },
    {
      key: "hourlyRate",
      label: "Rate",
      sortable: true,
      render: (dev) => (
        <span className="font-medium text-primary">{dev.hourlyRate} Kip/hr</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (dev) => getStatusBadge(dev.status),
    },
    {
      key: "bookings",
      label: "Stats",
      render: (dev) =>
        dev.status === "approved" && dev.bookings !== undefined ? (
          <div className="text-sm">
            <p>{dev.bookings} bookings</p>
            {dev.rating && (
              <p className="text-white">
                {dev.rating} rating
              </p>
            )}
          </div>
        ) : (
          <span className="text-white">-</span>
        ),
    },
  ]

  const renderMobileCard = (dev: Developer) => (
    <Card key={dev.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {dev.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{dev.name}</p>
              <p className="text-sm text-white">{dev.title}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedDeveloper(dev)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {dev.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(dev.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDeveloper(dev)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {dev.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {dev.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{dev.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {getStatusBadge(dev.status)}
          <span className="font-semibold text-primary">{dev.hourlyRate} Kip/hr</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1 text-white">
            <MapPin className="h-4 w-4" />
            {dev.location}
          </div>
          <div className="flex items-center gap-1 text-white">
            <Briefcase className="h-4 w-4" />
            {dev.experience} years
          </div>
        </div>

        {dev.status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedDeveloper(dev)
                setShowRejectDialog(true)
              }}
            >
              Reject
            </Button>
            <Button size="sm" className="flex-1" onClick={() => handleApprove(dev.id)}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Stats
  const pendingCount = localDevelopers.filter((d) => d.status === "pending").length
  const approvedCount = localDevelopers.filter((d) => d.status === "approved").length
  const rejectedCount = localDevelopers.filter((d) => d.status === "rejected").length

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
        <p className="text-white">
          Review and manage developer applications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-white">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
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
                <p className="text-sm text-white">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={localDevelopers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search developers by name..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(dev) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedDeveloper(dev)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {dev.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleApprove(dev.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDeveloper(dev)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Developer Detail Dialog */}
      <Dialog
        open={!!selectedDeveloper && !showRejectDialog}
        onOpenChange={() => setSelectedDeveloper(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedDeveloper && (
            <>
              <DialogHeader>
                <DialogTitle>Developer Profile</DialogTitle>
                <DialogDescription>
                  Review the developer{"'"}s information and application
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                      {selectedDeveloper.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedDeveloper.name}</h3>
                    <p className="text-white">{selectedDeveloper.title}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedDeveloper.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedDeveloper.location}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(selectedDeveloper.status)}
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Bio</h4>
                  <p className="text-sm text-white">{selectedDeveloper.bio}</p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeveloper.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </div>
                    <p className="mt-1 font-medium">{selectedDeveloper.experience} years</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate
                    </div>
                    <p className="mt-1 font-medium">{selectedDeveloper.hourlyRate} Kip/hour</p>
                  </div>
                </div>

                {selectedDeveloper.status === "approved" &&
                  selectedDeveloper.bookings !== undefined && (
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                      <div>
                        <p className="text-sm text-white">Total Bookings</p>
                        <p className="text-2xl font-bold">{selectedDeveloper.bookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white">Rating</p>
                        <p className="text-2xl font-bold">{selectedDeveloper.rating}</p>
                      </div>
                    </div>
                  )}
              </div>

              {selectedDeveloper.status === "pending" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(true)
                    }}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedDeveloper.id)}>
                    Approve Developer
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
