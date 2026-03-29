import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Code2,
  Languages,
  Award,
  ExternalLink,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { useState, useEffect } from "react"
import type { Route } from "./+types/detail"
import { Link, useFetcher } from "react-router"
import { requireAdmin } from "@/lib/admin-session.server"

// components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatusBadge } from "./components/getStatusBadge"

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request)

  const developer = await prisma.developer.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      specialties: true,
      skills: true,
      hourlyRate: true,
      experience: true,
      location: true,
      languages: true,
      availability: true,
      gender: true,
      career: true,
      dob: true,
      phone: true,
      website: true,
      github: true,
      status: true,
      rating: true,
      reviewCount: true,
      totalEarnings: true,
      completedJobs: true,
      certifications: true,
      portfolio: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      },
      education: {
        select: {
          school: true,
          degree: true,
          field: true,
          year: true,
        },
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  })

  if (!developer) {
    throw new Response("Developer not found", { status: 404 })
  }

  return { developer }
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "approve") {
    await prisma.developer.update({
      where: { id: params.id },
      data: { status: "ACTIVE" },
    })
    return { success: "Developer approved" }
  }

  if (intent === "reject") {
    await prisma.developer.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    })
    return { success: "Developer rejected" }
  }

  return { error: "Invalid action" }
}

export default function AdminDeveloperDetailPage({ loaderData }: Route.ComponentProps) {
  const { developer: dev } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setShowRejectDialog(false)
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleApprove = () => {
    fetcher.submit({ intent: "approve" }, { method: "post" })
  }

  const handleReject = () => {
    fetcher.submit({ intent: "reject" }, { method: "post" })
  }

  const initials = dev.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  const dob = dev.dob ? new Date(dev.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null
  const joinedAt = new Date(dev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="p-3 sm:p-6 mx-auto w-full sm:max-w-[90%]">
      {/* Back button */}
      <Link
        to="/admin/developers"
        className="inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Developers
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-border">
            {dev.user.avatar ? <AvatarImage src={dev.user.avatar} alt={dev.user.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-2xl font-bold">{dev.user.name}</h1>
              {getStatusBadge(dev.status)}
            </div>
            <p className="text-white mt-1">{dev.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {dev.user.email}
              </div>
              {dev.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {dev.location}
                </div>
              )}
              {dev.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {dev.phone}
                </div>
              )}
            </div>
            <div className="mt-2 flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{dev.rating}</span>
                <span className="text-white text-sm">({dev.reviewCount} reviews)</span>
              </div>
              <span className="text-sm text-white">Joined {joinedAt}</span>
            </div>
          </div>
        </div>

        {/* Action buttons for pending */}
        {dev.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-2 sm:space-y-6">
          {/* Bio */}
          {dev.user.bio && (
            <Card className="py-3">
              <CardHeader>
                <CardTitle className="text-lg text-primary">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-line">{dev.user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Code2 className="h-5 w-5 text-primary" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dev.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dev.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-primary/10 text-primary border border-primary/30 px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white">No skills listed</p>
              )}
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Award className="h-5 w-5 text-amber-500" />
                Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dev.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dev.specialties.map((spec: string) => (
                    <Badge key={spec} className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1">
                      {spec}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white">No specialties listed</p>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Languages className="h-5 w-5 text-blue-400" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dev.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dev.languages.map((lang: string) => (
                    <Badge key={lang} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1">
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white">No languages listed</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          {dev.education.length > 0 && (
            <Card className="py-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <GraduationCap className="h-5 w-5 text-emerald-400" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dev.education.map((edu: { school: string; degree: string; field: string; year: number }, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                      <GraduationCap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">{edu.school}</p>
                      <p className="text-sm text-white">{edu.degree} in {edu.field}</p>
                      <p className="text-xs text-white mt-1">Class of {edu.year}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {dev.certifications.length > 0 && (
            <Card className="py-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Award className="h-5 w-5 text-purple-400" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dev.certifications.map((cert: string, i: number) => (
                    <a
                      key={i}
                      href={cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
                    >
                      <Award className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-sm truncate flex-1">Certificate {i + 1}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-white shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </div>
                <span className="font-medium">{dev.experience} years</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <DollarSign className="h-4 w-4" />
                  Hourly Rate
                </div>
                <span className="font-medium">{dev.hourlyRate.toLocaleString()} Kip</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Briefcase className="h-4 w-4" />
                  Career
                </div>
                <span className="font-medium">{dev.career || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Users className="h-4 w-4" />
                  Gender
                </div>
                <span className="font-medium capitalize">{dev.gender || "-"}</span>
              </div>
              {dob && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </div>
                  <span className="font-medium">{dob}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Clock className="h-4 w-4" />
                  Availability
                </div>
                <Badge
                  variant="outline"
                  className={
                    dev.availability === "available"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      : "border-white/30 bg-white/5 text-white"
                  }
                >
                  {dev.availability || "Unknown"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="py-2 px-0">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold">{dev._count.bookings}</p>
                  <p className="text-xs text-white">Bookings</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold">{dev.completedJobs}</p>
                  <p className="text-xs text-white">Completed</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{dev.rating}</p>
                  <p className="text-xs text-white">Rating</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold">{dev._count.reviews}</p>
                  <p className="text-xs text-white">Reviews</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-white">Total Earnings</p>
                <p className="text-xl font-bold text-primary">{dev.totalEarnings.toLocaleString()} Kip</p>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          {(dev.website || dev.github) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dev.website && (
                  <a
                    href={dev.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{dev.website}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                {dev.github && (
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors"
                  >
                    <Code2 className="h-4 w-4" />
                    <span className="truncate">{dev.github}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
