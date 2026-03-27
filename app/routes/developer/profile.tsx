import { useEffect, useState } from "react"
import { Form, useFetcher, useActionData, useNavigation, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session.server"
import { uploadToBunny } from "@/lib/bunny.server"
import { toast } from "sonner"
import type { Route } from "./+types/profile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  Camera,
  MapPin,
  Briefcase,
  Star,
  X,
  Home,
  Users,
  Globe,
  GithubIcon,
  Shield,
  ExternalLink,
  Loader,
  Phone,
  GraduationCap,
  Upload,
  FileIcon,
  Trash2,
  Search,
  Wallet,
  Plus,
  Clock,
  CheckCircle2,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  ImageIcon,
  Download,
  ZoomIn,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const locations = [
  "Vientiane Capital",
  "Vientiane Province",
  "Luang Prabang",
  "Savannakhet",
  "Champasak",
  "Xieng Khouang",
  "Khammouan",
  "Luang Namtha",
  "Oudomxay",
  "Bokeo",
  "Phongsali",
  "Houaphan",
  "Saravane",
  "Sekong",
  "Attapeu",
  "Xayabouly",
  "Bolikhamxai",
  "Xaisomboun",
  "Other",
]

const availableSkills = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", "Java",
  "Flutter", "React Native", "AWS", "Docker", "Kubernetes", "PostgreSQL",
  "MongoDB", "GraphQL", "Next.js", "Vue.js", "Angular", "Go", "Rust",
  "PHP", "Laravel", "Django", "FastAPI", "Figma", "UI/UX Design",
  "DevOps", "Machine Learning", "Data Science", "Blockchain", "Solidity",
]

// --- Loader ---
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      emailVerified: true,
      notifyInApp: true,
      notifyEmail: true,
      showProfile: true,
      createdAt: true,
      developer: {
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
          profile: true,
          website: true,
          github: true,
          rating: true,
          reviewCount: true,
          education: true,
          certifications: true,
          status: true,
        },
      },
    },
  })

  if (!user || !user.developer) throw new Response("Not found", { status: 404 })

  const [pendingTopUps, wallet] = await Promise.all([
    prisma.topUpRequest.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.wallet.findUnique({
      where: { userId: session.userId },
      select: {
        balance: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, type: true, amount: true, description: true, createdAt: true },
        },
      },
    }),
  ])

  return { user, pendingTopUps, wallet }
}

// --- Action ---
export async function action({ request }: Route.ActionArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "update-profile") {
    const name = String(formData.get("name") || "").trim()
    const title = String(formData.get("title") || "").trim()
    const bio = String(formData.get("bio") || "").trim()
    const location = String(formData.get("location") || "")
    const experience = parseInt(String(formData.get("experience"))) || 0
    const hourlyRate = parseFloat(String(formData.get("hourlyRate"))) || 0
    const gender = String(formData.get("gender") || "")
    const career = String(formData.get("career") || "")
    const dob = String(formData.get("dob") || "")
    const phone = String(formData.get("phone") || "")
    const website = String(formData.get("website") || "")
    const github = String(formData.get("github") || "")
    const avatarUrl = String(formData.get("avatarUrl") || "")

    if (!name || !title) return { intent, error: "Name and title are required" }

    await prisma.user.update({
      where: { id: session.userId },
      data: { name, bio, ...(avatarUrl ? { avatar: avatarUrl } : {}) },
    })

    await prisma.developer.update({
      where: { userId: session.userId },
      data: {
        title,
        location,
        experience,
        hourlyRate,
        gender,
        career,
        dob: dob ? new Date(dob) : undefined,
        phone,
        website: website || null,
        github: github || null,
      },
    })

    return { intent, success: "Profile updated successfully" }
  }

  if (intent === "update-skills") {
    const skills = formData.getAll("skills").map(String).filter(Boolean)
    const specialties = formData.getAll("specialties").map(String).filter(Boolean)
    const languages = formData.getAll("languages").map(String).filter(Boolean)
    await prisma.developer.update({
      where: { userId: session.userId },
      data: { skills, specialties, languages },
    })
    return { intent, success: "Skills updated" }
  }

  if (intent === "upload-avatar") {
    const file = formData.get("avatar") as File | null
    if (!file || file.size === 0) return { intent, error: "No file selected" }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return { intent, error: "File too large. Maximum 5MB" }

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) return { intent, error: "Invalid file type" }

    const url = await uploadToBunny(file, "avatars")
    return { intent, success: "Avatar uploaded", avatarUrl: url }
  }

  if (intent === "upload-certification") {
    const file = formData.get("certification") as File | null
    if (!file || file.size === 0) return { intent, error: "No file selected" }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) return { intent, error: "File too large. Maximum 10MB" }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) return { intent, error: "Invalid file type. Use JPG, PNG, WebP, or PDF" }

    const url = await uploadToBunny(file, "certifications")

    // Append to existing certifications
    const dev = await prisma.developer.findUnique({ where: { userId: session.userId }, select: { certifications: true } })
    const certs = [...(dev?.certifications || []), url]
    await prisma.developer.update({ where: { userId: session.userId }, data: { certifications: certs } })

    return { intent, success: "Certification uploaded", certUrl: url }
  }

  if (intent === "remove-certification") {
    const url = String(formData.get("url") || "")
    if (!url) return { intent, error: "No URL" }

    const dev = await prisma.developer.findUnique({ where: { userId: session.userId }, select: { certifications: true } })
    const certs = (dev?.certifications || []).filter(c => c !== url)
    await prisma.developer.update({ where: { userId: session.userId }, data: { certifications: certs } })

    return { intent, success: "Certification removed" }
  }

  if (intent === "toggle-availability") {
    const available = formData.get("available") === "true"
    await prisma.developer.update({
      where: { userId: session.userId },
      data: { availability: available ? "available" : "unavailable" },
    })
    return { intent, success: available ? "You are now available for bookings" : "You are now unavailable" }
  }

  // --- Toggle Setting ---
  if (intent === "toggle-setting") {
    const field = String(formData.get("field"))
    const value = formData.get("value") === "true"

    const allowedFields = ["notifyInApp", "notifyEmail", "showProfile"] as const
    if (!allowedFields.includes(field as (typeof allowedFields)[number])) {
      return { intent, error: "Invalid setting" }
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { [field]: value },
    })

    return { intent, success: "Setting updated" }
  }

  // --- Delete Account (soft delete) ---
  if (intent === "delete-account") {
    await prisma.user.update({
      where: { id: session.userId },
      data: { status: "inactive" },
    })

    return { intent, success: "Account deactivated" }
  }

  // --- Top-up Request ---
  if (intent === "topup-request") {
    const amount = Number(formData.get("amount"))
    const slipFile = formData.get("slip") as File

    if (!amount || amount <= 0) return { intent, error: "Please enter a valid amount" }
    if (!slipFile || slipFile.size === 0) return { intent, error: "Please upload a payment slip" }
    if (slipFile.size > 10 * 1024 * 1024) return { intent, error: "File must be less than 10MB" }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(slipFile.type)) return { intent, error: "Only JPG, PNG, or WebP files are allowed" }

    const slipUrl = await uploadToBunny(slipFile, "payment-slips")

    await prisma.topUpRequest.create({
      data: {
        userId: session.userId,
        amount,
        slipUrl,
      },
    })

    return { intent, success: "Top-up request submitted! Your balance will be updated once approved by admin." }
  }

  return { error: "Invalid action" }
}

// --- Component ---
export default function DeveloperProfilePage({ loaderData }: Route.ComponentProps) {
  const { user, pendingTopUps, wallet } = loaderData
  const dev = user.developer!
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userType="developer" userName={user.name} />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Manage your public profile and services</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <ProfileForm user={user} dev={dev} actionData={actionData} navigation={navigation} initials={initials} />
              <CertificationsSection certifications={dev.certifications} />
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <SkillsSection skills={dev.skills} specialties={dev.specialties} languages={dev.languages} />
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <DevWalletSection pendingTopUps={pendingTopUps} wallet={wallet} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <AvailabilityCard availability={dev.availability} />

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingToggle
                    field="notifyInApp"
                    label="In-App notification"
                    description="Get notified when you receive a new booking"
                    defaultValue={user.notifyInApp}
                  />
                  <SettingToggle
                    field="notifyEmail"
                    label="Email notification"
                    description="Receive reminders before your sessions"
                    defaultValue={user.notifyEmail}
                  />
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingToggle
                    field="showProfile"
                    label="Show profile to users"
                    description="Allow users to see your profile information"
                    defaultValue={user.showProfile}
                  />
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-white">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <DeleteAccountButton />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}

// --- Profile Form (all fields, one card, separated by hr) ---
function ProfileForm({
  user,
  dev,
  actionData,
  navigation,
  initials,
}: {
  user: any
  dev: any
  actionData: any
  navigation: any
  initials: string
}) {
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "update-profile"
  const profileData = actionData && "intent" in actionData && actionData.intent === "update-profile" ? actionData : null
  const dobValue = dev.dob ? new Date(dev.dob).toISOString().split("T")[0] : ""

  // Avatar: upload to Bunny on select, store URL for save
  const avatarFetcher = useFetcher<typeof action>()
  const isUploading = avatarFetcher.state !== "idle"

  const uploadedAvatarUrl =
    avatarFetcher.data && "intent" in avatarFetcher.data && avatarFetcher.data.intent === "upload-avatar" && "avatarUrl" in avatarFetcher.data
      ? (avatarFetcher.data.avatarUrl as string)
      : null

  const displayAvatar = uploadedAvatarUrl || user.avatar

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.set("intent", "upload-avatar")
    fd.set("avatar", file)
    avatarFetcher.submit(fd, { method: "post", encType: "multipart/form-data" })
  }

  return (
    <Card className="border border-primary/50">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your professional details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <input type="hidden" name="intent" value="update-profile" />
          {/* Pass uploaded avatar URL so it saves with the form */}
          {uploadedAvatarUrl && <input type="hidden" name="avatarUrl" value={uploadedAvatarUrl} />}

          {/* Avatar + Stats */}
          <div className="flex flex-col items-center gap-6 sm:flex-row mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                {displayAvatar ? <AvatarImage src={displayAvatar} alt="Profile" /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <label className={`absolute bottom-1 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80 ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
                {isUploading ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{dev.title}</p>
              <div className="mt-2 flex items-center justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{dev.rating}</span>
                  <span className="text-muted-foreground">({dev.reviewCount} reviews)</span>
                </div>
                {(dev.status === "APPROVED" || dev.status === "ACTIVE") && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              {uploadedAvatarUrl && (
                <p className="mt-1 text-xs text-emerald-400">New photo uploaded. Click Save Changes to apply.</p>
              )}
            </div>
          </div>

          <hr className="my-6 border-border" />

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-rose-500">*</span></Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-rose-500">*</span></Label>
                <Input id="title" name="title" defaultValue={dev.title} required placeholder="e.g. Senior Full-Stack Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select name="location" defaultValue={dev.location || ""}>
                  <SelectTrigger className="w-full border border-primary/50">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="experience" name="experience" type="number" className="pl-9" defaultValue={dev.experience} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio <span className="text-rose-500">*</span></Label>
              <Textarea id="bio" name="bio" rows={3} defaultValue={user.bio || ""} placeholder="Tell clients about yourself..." />
            </div>
          </div>

          <hr className="my-6 border-border" />

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender<span className="text-rose-500">*</span></Label>
                <Select name="gender" defaultValue={dev.gender || ""}>
                  <SelectTrigger className="w-full border border-primary/50">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="dob" name="dob" type="date" className="pl-9" defaultValue={dobValue} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" name="phone" type="tel" className="pl-9" defaultValue={dev.phone || ""} placeholder="+856 20 ..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Career <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="career" name="career" className="pl-9" defaultValue={dev.career || ""} placeholder="e.g. Software Engineer" />
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6 border-border" />

          {/* Rate & Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate & Links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input id="website" name="website" defaultValue={dev.website || ""} placeholder="https://yourwebsite.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </Label>
                <Input id="github" name="github" defaultValue={dev.github || ""} placeholder="https://github.com/username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (Kip)</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" defaultValue={dev.hourlyRate} />
              </div>
              <div className="mt-6 flex justify-start">
                <Button type="submit" className="gap-2 mt-2 w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {profileData?.error && (
            <p className="mt-4 text-sm text-destructive">{profileData.error}</p>
          )}
          {profileData?.success && (
            <p className="mt-4 text-sm text-emerald-400">{profileData.success}</p>
          )}

        </Form>
      </CardContent>
    </Card>
  )
}

// --- Reusable Tag Input ---
function TagInput({
  items,
  onAdd,
  onRemove,
  placeholder,
  badgeColor = "bg-primary/10 text-primary border-primary/30",
}: {
  items: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  placeholder: string
  badgeColor?: string
}) {
  const [input, setInput] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (input.trim() && !items.includes(input.trim())) {
        onAdd(input.trim())
        setInput("")
      }
    }
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} className={`gap-1 px-3 py-1.5 border ${badgeColor} hover:opacity-80`}>
              {item}
              <button onClick={() => onRemove(item)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  )
}

// --- Skills Section (with specialties & languages) ---
function SkillsSection({
  skills: initialSkills,
  specialties: initialSpecialties,
  languages: initialLanguages,
}: {
  skills: string[]
  specialties: string[]
  languages: string[]
}) {
  const [currentSkills, setCurrentSkills] = useState(initialSkills)
  const [currentSpecialties, setCurrentSpecialties] = useState(initialSpecialties)
  const [currentLanguages, setCurrentLanguages] = useState(initialLanguages)
  const [skillSearch, setSkillSearch] = useState("")
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== "idle"

  const filteredSkills = skillSearch
    ? availableSkills.filter(
      (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !currentSkills.includes(s)
    )
    : availableSkills.filter((s) => !currentSkills.includes(s))

  const popularSkills = availableSkills.filter((s) => !currentSkills.includes(s)).slice(0, 10)

  const addSkill = (skill: string) => {
    if (!currentSkills.includes(skill) && currentSkills.length < 10) {
      setCurrentSkills([...currentSkills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill))
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (skillSearch.trim() && !currentSkills.includes(skillSearch.trim())) {
        addSkill(skillSearch.trim())
        setSkillSearch("")
      }
    }
  }

  const saveAll = () => {
    const fd = new FormData()
    fd.set("intent", "update-skills")
    currentSkills.forEach((s) => fd.append("skills", s))
    currentSpecialties.forEach((s) => fd.append("specialties", s))
    currentLanguages.forEach((s) => fd.append("languages", s))
    fetcher.submit(fd, { method: "post" })
  }

  useEffect(() => {
    if (fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "update-skills" && "success" in fetcher.data) {
      toast.success("Skills & expertise updated successfully")
    }
  }, [fetcher.data])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
        <CardDescription>Manage your skills, specialties, and languages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skills (max 10)</h3>

          {currentSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill) => (
                <Badge
                  key={skill}
                  className="gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9"
            />
          </div>

          {skillSearch ? (
            filteredSkills.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Search Results</p>
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => { addSkill(skill); setSkillSearch("") }}
                      disabled={currentSkills.length >= 10}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No matching skills. Press Enter to add "{skillSearch}" as custom skill.</p>
            )
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Popular Skills</p>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    disabled={currentSkills.length >= 10}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{currentSkills.length}/10 skills selected</p>
        </div>

        <hr className="border-border" />

        {/* Specialties */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Specialties</h3>
          <TagInput
            items={currentSpecialties}
            onAdd={(s) => setCurrentSpecialties([...currentSpecialties, s])}
            onRemove={(s) => setCurrentSpecialties(currentSpecialties.filter((x) => x !== s))}
            placeholder="e.g. Frontend, Backend, DevOps..."
            badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/30"
          />
        </div>

        <hr className="border-border" />

        {/* Languages */}
        <LanguagesInput
          items={currentLanguages}
          onAdd={(s) => setCurrentLanguages([...currentLanguages, s])}
          onRemove={(s) => setCurrentLanguages(currentLanguages.filter((x) => x !== s))}
        />

        <div className="flex justify-end pt-2">
          <Button onClick={saveAll} disabled={isSaving} className="gap-2">
            {isSaving ? <><Loader className="h-4 w-4 animate-spin" /> Saving...</> : "Save All"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Languages Input (search + popular, same as skills) ---
const availableLanguages = [
  "Hmong", "Lao", "English", "Thai", "Vietnamese", "Chinese", "Japanese",
  "Korean", "French", "German", "Spanish", "Russian", "Hindi",
  "Khmer", "Burmese", "Malay", "Indonesian", "Portuguese", "Arabic",
]

function LanguagesInput({
  items,
  onAdd,
  onRemove,
}: {
  items: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? availableLanguages.filter(
      (l) => l.toLowerCase().includes(search.toLowerCase()) && !items.includes(l)
    )
    : availableLanguages.filter((l) => !items.includes(l))

  const popular = availableLanguages.filter((l) => !items.includes(l)).slice(0, 8)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (search.trim() && !items.includes(search.trim())) {
        onAdd(search.trim())
        setSearch("")
      }
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Languages</h3>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((lang) => (
            <Badge
              key={lang}
              className="gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
            >
              {lang}
              <button onClick={() => onRemove(lang)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>

      {search ? (
        filtered.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Search Results</p>
            <div className="flex flex-wrap gap-2">
              {filtered.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { onAdd(lang); setSearch("") }}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-amber-500/50 hover:bg-amber-500/5"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No match. Press Enter to add "{search}".</p>
        )
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Popular Languages</p>
          <div className="flex flex-wrap gap-2">
            {popular.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onAdd(lang)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-amber-500/50 hover:bg-amber-500/5"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Certifications Section (file upload, at the bottom) ---
function CertificationsSection({ certifications }: { certifications: string[] }) {
  const uploadFetcher = useFetcher<typeof action>()
  const removeFetcher = useFetcher<typeof action>()
  const isUploading = uploadFetcher.state !== "idle"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.set("intent", "upload-certification")
    fd.set("certification", file)
    uploadFetcher.submit(fd, { method: "post", encType: "multipart/form-data" })
    e.target.value = ""
  }

  const handleRemove = (url: string) => {
    const fd = new FormData()
    fd.set("intent", "remove-certification")
    fd.set("url", url)
    removeFetcher.submit(fd, { method: "post" })
  }

  useEffect(() => {
    if (uploadFetcher.data && "intent" in uploadFetcher.data && uploadFetcher.data.intent === "upload-certification" && "success" in uploadFetcher.data) {
      toast.success("Certification uploaded")
    }
  }, [uploadFetcher.data])

  const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf")

  return (
    <Card className="border-border border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Certifications
        </CardTitle>
        <CardDescription>Upload your certifications (PDF or images, max 10MB each)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing certifications */}
        {certifications.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {certifications.map((cert, i) => (
              <div key={i} className="group relative flex items-center gap-3 rounded-lg border border-primary/50 p-3">
                {isPdf(cert) ? (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-red-500/10">
                    <FileIcon className="h-6 w-6 text-red-400" />
                  </div>
                ) : (
                  <img src={cert} alt={`Certification ${i + 1}`} className="h-12 w-12 shrink-0 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Certification {i + 1}</p>
                  <a
                    href={cert}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View file
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(cert)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/50 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
          {isUploading ? (
            <>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload certification (PDF, JPG, PNG, WebP)</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {uploadFetcher.data && "intent" in uploadFetcher.data && uploadFetcher.data.intent === "upload-certification" && "error" in uploadFetcher.data && (
          <p className="text-sm text-destructive">{String(uploadFetcher.data.error)}</p>
        )}
      </CardContent>
    </Card>
  )
}

// --- Setting Toggle ---
function SettingToggle({ field, label, description, defaultValue }: {
  field: string
  label: string
  description: string
  defaultValue: boolean
}) {
  const fetcher = useFetcher<typeof action>()
  const [checked, setChecked] = useState(defaultValue)

  const handleToggle = (value: boolean) => {
    setChecked(value)
    fetcher.submit(
      { intent: "toggle-setting", field, value: String(value) },
      { method: "post" }
    )
  }

  useEffect(() => {
    if (fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "toggle-setting" && "success" in fetcher.data) {
      toast.success(`${label} ${checked ? "enabled" : "disabled"}`)
    }
  }, [fetcher.data])

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-white">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={handleToggle} />
    </div>
  )
}

// --- Delete Account Button ---
function DeleteAccountButton() {
  const fetcher = useFetcher<typeof action>()
  const isDeleting = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "delete-account" && "success" in fetcher.data) {
      toast.success("Your account has been deactivated.")
      window.location.href = "/login"
    }
  }, [fetcher.data])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will deactivate your account. You will be logged out and will no longer be able to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault()
              fetcher.submit({ intent: "delete-account" }, { method: "post" })
            }}
          >
            {isDeleting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete my account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// --- Availability Card ---
function AvailabilityCard({ availability }: { availability: string | null }) {
  const fetcher = useFetcher<typeof action>()
  const isAvailable = availability === "available" || availability === null

  const handleToggle = (checked: boolean) => {
    const fd = new FormData()
    fd.set("intent", "toggle-availability")
    fd.set("available", String(checked))
    fetcher.submit(fd, { method: "post" })
    toast.success(checked ? "You are now available for bookings" : "You are now unavailable")
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Control when clients can book you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Available for Bookings</p>
            <p className="text-sm text-muted-foreground">
              {isAvailable
                ? "Your profile is visible and clients can book sessions"
                : "Your profile is hidden from search results"}
            </p>
          </div>
          <Switch defaultChecked={isAvailable} onCheckedChange={handleToggle} />
        </div>
      </CardContent>
    </Card>
  )
}

// --- Wallet Section for Developers ---
type TopUpRequest = {
  id: string
  amount: number
  slipUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date | string
}

type WalletTransaction = {
  id: string
  type: string
  amount: number
  description: string
  createdAt: Date | string
}

type WalletData = {
  balance: number
  transactions: WalletTransaction[]
} | null

function DevWalletSection({ pendingTopUps, wallet }: { pendingTopUps: TopUpRequest[]; wallet: WalletData }) {
  const fetcher = useFetcher<typeof action>()
  const balance = wallet?.balance ?? 0
  const transactions = wallet?.transactions ?? []
  const [topUpAmount, setTopUpAmount] = useState<number | "">("")
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpStep, setTopUpStep] = useState<"select" | "payment" | "upload">("select")
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const [showExampleSlip, setShowExampleSlip] = useState(false)
  const [pickedQuickAmount, setPickedQuickAmount] = useState(false)

  const isSubmitting = fetcher.state !== "idle"
  const fetcherSuccess = fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "topup-request" && "success" in fetcher.data

  useEffect(() => {
    if (fetcherSuccess) {
      toast.success("Top-up request submitted! Your balance will be updated once approved by admin.")
      resetTopUp()
    }
  }, [fetcherSuccess])

  const quickAmounts = topUpAmount && Number(topUpAmount) > 0 && !pickedQuickAmount
    ? [
      Number(topUpAmount) * 1000,
      Number(topUpAmount) * 10000,
      Number(topUpAmount) * 100000,
      Number(topUpAmount) * 1000000,
    ]
    : []

  const handleContinue = () => {
    if (!topUpAmount || topUpAmount <= 0) return
    setTopUpStep("payment")
  }

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSlipFile(file)
    setSlipPreview(URL.createObjectURL(file))
  }

  const handleSubmitTopUp = () => {
    if (!slipFile || !topUpAmount) return
    const formData = new FormData()
    formData.set("intent", "topup-request")
    formData.set("amount", String(topUpAmount))
    formData.set("slip", slipFile)
    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" })
  }

  const resetTopUp = () => {
    setTopUpAmount("")
    setPickedQuickAmount(false)
    setTopUpStep("select")
    setSlipFile(null)
    setSlipPreview(null)
    setIsTopUpOpen(false)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TOP_UP": return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
      case "BOOKING_PAYMENT": return <ArrowUpRight className="h-4 w-4 text-orange-400" />
      case "COFFEE_TIP": return <Coffee className="h-4 w-4 text-amber-400" />
      case "REFUND": return <ArrowDownLeft className="h-4 w-4 text-blue-400" />
      default: return <History className="h-4 w-4 text-white" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400"><Clock className="h-3 w-3" />Pending</span>
      case "APPROVED": return <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" />Approved</span>
      case "REJECTED": return <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"><X className="h-3 w-3" />Rejected</span>
      default: return null
    }
  }

  const fetcherError = fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "topup-request" && "error" in fetcher.data

  return (
    <>
      {/* Balance Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-3xl sm:text-4xl mt-1">
              {balance.toLocaleString()} <span className="text-lg font-normal text-white">Kip</span>
            </CardTitle>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="mt-4">
          <Dialog open={isTopUpOpen} onOpenChange={(open) => {
            setIsTopUpOpen(open)
            if (!open) resetTopUp()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              {/* Step 1: Enter Amount */}
              {topUpStep === "select" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Top Up Wallet</DialogTitle>
                    <DialogDescription>Enter the amount you'd like to add</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label>Amount (Kip)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Type a number to see quick amounts..."
                          value={topUpAmount}
                          onChange={(e) => { setTopUpAmount(e.target.value ? Number(e.target.value) : ""); setPickedQuickAmount(false) }}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white">Kip</span>
                      </div>
                    </div>

                    {quickAmounts.length > 0 && (
                      <div>
                        <label className="mb-3 block text-sm font-medium text-white">Quick amounts</label>
                        <div className="grid grid-cols-2 gap-2">
                          {quickAmounts.map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => { setTopUpAmount(amount); setPickedQuickAmount(true) }}
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                                topUpAmount === amount
                                  ? "border-primary bg-primary/10 text-white"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              {amount.toLocaleString()} Kip
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button className="w-full gap-2" disabled={!topUpAmount || topUpAmount <= 0} onClick={handleContinue}>
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: Payment via QR Code */}
              {topUpStep === "payment" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Pay via Bank Transfer</DialogTitle>
                    <DialogDescription>
                      Scan or download the QR code and pay <span className="font-semibold text-white">{Number(topUpAmount).toLocaleString()} Kip</span> using your bank app
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
                        <img src="/qr-code.jpeg" alt="Payment QR Code" className="h-48 w-48 object-contain" />
                      </div>
                      <a href="/qr-code.jpeg" download="laodev-qr-code.jpeg" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Download className="h-4 w-4" />
                        Download QR Code
                      </a>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm space-y-2">
                      <p className="font-medium">How to pay:</p>
                      <ol className="list-decimal list-inside space-y-1 text-white">
                        <li>Download or screenshot the QR code above</li>
                        <li>Open your bank app (BCEL One, LDB, JDB, etc.)</li>
                        <li>Scan the QR code and pay <span className="font-semibold text-white">{Number(topUpAmount).toLocaleString()} Kip</span></li>
                        <li>Take a screenshot of your payment confirmation</li>
                        <li>Upload the payment slip in the next step</li>
                      </ol>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setTopUpStep("select")}>Back</Button>
                      <Button className="flex-1" onClick={() => setTopUpStep("upload")}>I've Paid — Upload Slip</Button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Upload Payment Slip */}
              {topUpStep === "upload" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Upload Payment Slip</DialogTitle>
                    <DialogDescription>
                      Upload your payment confirmation for <span className="font-semibold text-white">{Number(topUpAmount).toLocaleString()} Kip</span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    {!slipPreview && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Example payment slip:</p>
                        <button type="button" onClick={() => setShowExampleSlip(true)} className="group relative overflow-hidden rounded-lg border border-border">
                          <img src="/payment-slip.jpg" alt="Example payment slip" className="h-24 w-auto object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ZoomIn className="h-5 w-5 text-white" />
                          </div>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      {slipPreview ? (
                        <div className="relative w-full">
                          <img src={slipPreview} alt="Payment slip preview" className="mx-auto max-h-64 rounded-lg border border-border object-contain" />
                          <button type="button" onClick={() => { setSlipFile(null); setSlipPreview(null) }} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Click to upload payment slip</p>
                            <p className="text-sm text-white">JPG, PNG or WebP (max 10MB)</p>
                          </div>
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSlipChange} />
                        </label>
                      )}
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Top-up amount</span>
                        <span className="font-semibold">{Number(topUpAmount).toLocaleString()} Kip</span>
                      </div>
                    </div>

                    {fetcherError && fetcher.data && "error" in fetcher.data && (
                      <p className="text-sm text-destructive">{fetcher.data.error as string}</p>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setTopUpStep("payment")}>Back</Button>
                      <Button className="flex-1 gap-2" disabled={!slipFile || isSubmitting} onClick={handleSubmitTopUp}>
                        {isSubmitting ? (
                          <><Loader className="h-4 w-4 animate-spin" />Submitting...</>
                        ) : (
                          "Submit Top-up"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Fullscreen Example Slip Viewer */}
          <Dialog open={showExampleSlip} onOpenChange={setShowExampleSlip}>
            <DialogContent className="max-w-lg p-2">
              <img src="/payment-slip.jpg" alt="Example payment slip" className="w-full rounded-lg object-contain" />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Pending Top-up Requests */}
      {pendingTopUps.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Top-up Requests
            </CardTitle>
            <CardDescription>Your recent top-up submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTopUps.map((req) => (
                <div key={req.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      <ImageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{req.amount.toLocaleString()} Kip</p>
                      <p className="text-sm text-white">
                        {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <History className="mx-auto h-8 w-8 text-white/50" />
              <p className="mt-2 text-sm text-white">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-white">{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-semibold",
                    (tx.type === "TOP_UP" || tx.type === "REFUND") ? "text-emerald-400" : "text-white"
                  )}>
                    {(tx.type === "TOP_UP" || tx.type === "REFUND") ? "+" : "-"}{tx.amount.toLocaleString()} Kip
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
