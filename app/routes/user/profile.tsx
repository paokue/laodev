import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Form, useFetcher, useActionData, useNavigation } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { requireUser, createSession } from "@/lib/session.server"
import { verifyPassword, hashPassword } from "@/lib/auth.server"
import { uploadToBunny } from "@/lib/bunny.server"
import type { Route } from "./+types/profile"
import {
  Calendar,
  MessageSquare,
  Camera,
  Search,
  Home,
  Users,
  Mail,
  Shield,
  Bell,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  CheckCircle2,
  History,
  Eye,
  EyeOff,
  Loader,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  User,
  Upload,
  Download,
  X,
  Clock,
  ImageIcon,
  ZoomIn,
} from "lucide-react"

const bottomBarItems = [
  { href: "/user", label: "Home", icon: Home },
  { href: "/user/bookings", label: "Bookings", icon: Calendar },
  { href: "/developers", label: "Find", icon: Search },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: Users },
]


// --- Loader ---
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireUser(request, ["USER", "ADMIN"])
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      phone: true,
      address: true,
      dob: true,
      gender: true,
      status: true,
      interests: true,
      career: true,
      education: true,
      createdAt: true,
      emailVerified: true,
      notifyInApp: true,
      notifyEmail: true,
      showProfile: true,
    },
  })

  if (!user) throw new Response("User not found", { status: 404 })

  const pendingTopUps = await prisma.topUpRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  return { user, pendingTopUps, wallet }
}

// --- Action ---
export async function action({ request }: Route.ActionArgs) {
  const session = await requireUser(request, ["USER", "ADMIN"])
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  // --- Update Profile ---
  if (intent === "update-profile") {
    const name = String(formData.get("name") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const bio = formData.get("bio") ? String(formData.get("bio")).trim() : null
    const phone = formData.get("phone") ? String(formData.get("phone")).trim() : null
    const address = formData.get("address") ? String(formData.get("address")).trim() : null
    const dobRaw = formData.get("dob") ? String(formData.get("dob")).trim() : null
    const dob = dobRaw ? new Date(dobRaw) : null
    const gender = formData.get("gender") ? String(formData.get("gender")).trim() : null
    const status = formData.get("status") ? String(formData.get("status")).trim() : null
    const career = formData.get("career") ? String(formData.get("career")).trim() : null
    const education = formData.get("education") ? String(formData.get("education")).trim() : null
    const interestsRaw = formData.get("interests") ? String(formData.get("interests")).trim() : ""
    const interests = interestsRaw
      ? interestsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : null

    if (!name || !email) {
      return { intent, error: "Name and email are required" }
    }

    // Check if email is taken by another user
    if (email !== session.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== session.userId) {
        return { intent, error: "Email is already in use" }
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: { name, email, bio, phone, address, dob, gender, status, career, education, interests },
    })

    // Refresh session if name/email changed
    const cookie = await createSession({
      userId: updated.id,
      email: updated.email,
      role: session.role,
      name: updated.name,
    })

    return new Response(
      JSON.stringify({ intent, success: "Profile updated successfully" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    )
  }

  // --- Upload Avatar ---
  if (intent === "upload-avatar") {
    const file = formData.get("avatar") as File | null
    if (!file || file.size === 0) {
      return { intent, error: "No file selected" }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { intent, error: "File too large. Maximum 5MB" }
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return { intent, error: "Invalid file type. Use JPG, PNG, or WebP" }
    }

    const url = await uploadToBunny(file, "avatars")

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatar: url },
    })

    return { intent, success: "Avatar updated", avatarUrl: url }
  }

  // --- Change Password ---
  if (intent === "change-password") {
    const currentPassword = String(formData.get("currentPassword") || "")
    const newPassword = String(formData.get("newPassword") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { intent, error: "All password fields are required" }
    }

    if (newPassword.length < 8) {
      return { intent, error: "New password must be at least 8 characters" }
    }

    if (newPassword !== confirmPassword) {
      return { intent, error: "New passwords do not match" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { password: true },
    })

    if (!user) {
      return { intent, error: "User not found" }
    }

    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return { intent, error: "Current password is incorrect" }
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashed },
    })

    return { intent, success: "Password changed successfully" }
  }

  // --- Top Up Request ---
  if (intent === "topup-request") {
    const amount = Number(formData.get("amount"))
    const file = formData.get("slip") as File | null

    if (!amount || amount <= 0) {
      return { intent, error: "Please enter a valid amount" }
    }

    if (!file || file.size === 0) {
      return { intent, error: "Please upload your payment slip" }
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { intent, error: "File too large. Maximum 10MB" }
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return { intent, error: "Invalid file type. Use JPG, PNG, or WebP" }
    }

    const slipUrl = await uploadToBunny(file, "payment-slips")

    await prisma.topUpRequest.create({
      data: {
        userId: session.userId,
        amount,
        slipUrl,
      },
    })

    return { intent, success: "Top-up request submitted! Your balance will be updated once approved by admin." }
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

  return { error: "Invalid action" }
}

// --- Component ---
export default function UserProfilePage({ loaderData }: Route.ComponentProps) {
  const { user, pendingTopUps, wallet } = loaderData
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="user"
        userName={user.name}
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="payment">Wallet</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Basic Info */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <AvatarUpload
                      currentAvatar={user.avatar}
                      initials={initials}
                    />
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-muted-foreground">Member since {memberSince}</p>
                      <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                        {user.emailVerified && (
                          <span className="flex items-center gap-1 text-sm text-emerald-400">
                            <Shield className="h-4 w-4" />
                            Email Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ProfileForm
                    user={user}
                    actionData={actionData && "intent" in actionData && actionData.intent === "update-profile" ? actionData : null}
                    isSubmitting={navigation.state === "submitting" && navigation.formData?.get("intent") === "update-profile"}
                  />
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm
                    actionData={actionData && "intent" in actionData && actionData.intent === "change-password" ? actionData : null}
                    isSubmitting={navigation.state === "submitting" && navigation.formData?.get("intent") === "change-password"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="payment" className="space-y-6">
              <WalletSection pendingTopUps={pendingTopUps} wallet={wallet} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
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
                    description="Get notified when your booking is confirmed"
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
                    label="Show profile to developers"
                    description="Allow developers to see your profile information"
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
                      <p className="text-sm text-muted-foreground">
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

// --- Avatar Upload (auto-submits on file select) ---
function AvatarUpload({ currentAvatar, initials }: { currentAvatar: string | null; initials: string }) {
  const fetcher = useFetcher<typeof action>()
  const isUploading = fetcher.state !== "idle"

  const uploadedUrl =
    fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "upload-avatar" && "avatarUrl" in fetcher.data
      ? (fetcher.data.avatarUrl as string)
      : null

  const displayAvatar = uploadedUrl || currentAvatar
  const error =
    fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "upload-avatar" && "error" in fetcher.data
      ? (fetcher.data.error as string)
      : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set("intent", "upload-avatar")
    formData.set("avatar", file)
    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          {displayAvatar ? (
            <AvatarImage src={displayAvatar} alt="Profile" />
          ) : null}
          <AvatarFallback className="bg-blue-500/10 text-blue-400 text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <label
          className={cn(
            "absolute bottom-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          {isUploading ? (
            <Loader className="h-3 w-3 animate-spin text-white" />
          ) : (
            <Camera className="h-3 w-3" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// --- Profile Form ---
function ProfileForm({
  user,
  actionData,
  isSubmitting,
}: {
  user: {
    name: string
    email: string
    bio: string | null
    phone: string | null
    address: string | null
    dob: Date | string | null
    gender: string | null
    status: string | null
    interests: unknown
    career: string | null
    education: string | null
  }
  actionData: { error?: string; success?: string } | null
  isSubmitting: boolean
}) {
  const dobValue = user.dob ? new Date(user.dob).toISOString().split("T")[0] : ""
  const interestsValue = Array.isArray(user.interests) ? (user.interests as string[]).join(", ") : ""

  return (
    <Form method="post">
      <input type="hidden" name="intent" value="update-profile" />
      <div className="space-y-6 py-6">
        {/* Name & Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 mt-1 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" name="name" defaultValue={user.name} required className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" className="pl-9" defaultValue={user.email} required />
            </div>
          </div>
        </div>

        {/* Phone & Date of Birth */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" name="phone" type="tel" className="pl-9" defaultValue={user.phone || ""} placeholder="+856 20 xxxx xxxx" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Calendar className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="dob" name="dob" type="date" className="pl-9" defaultValue={dobValue} />
            </div>
          </div>
        </div>

        {/* Gender & Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-rose-500">*</span></Label>
            <Select name="gender" defaultValue={user.gender || ""}>
              <SelectTrigger className="w-full border border-primary/20">
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
            <Label htmlFor="status">Status <span className="text-rose-500">*</span></Label>
            <Select name="status" defaultValue={user.status || ""}>
              <SelectTrigger className="w-full border border-primary/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
            <Input id="address" name="address" className="pl-9" defaultValue={user.address || ""} placeholder="City, Country" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio <span className="text-rose-500">*</span></Label>
          <Textarea className="border border-primary/30" id="bio" name="bio" rows={3} defaultValue={user.bio || ""} placeholder="Tell us about yourself..." />
        </div>

        {/* Career & Education */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="career">Career <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Briefcase className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="career" name="career" className="pl-9" defaultValue={user.career || ""} placeholder="e.g. Software Engineer" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Education <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="education" name="education" className="pl-9" defaultValue={user.education || ""} placeholder="e.g. BSc Computer Science" />
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label htmlFor="interests">Interests <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Heart className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="interests" name="interests" className="pl-9" defaultValue={interestsValue} placeholder="e.g. React, TypeScript, DevOps (comma separated)" />
          </div>
          <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
        </div>
      </div>

      {actionData?.error && (
        <p className="mb-4 text-sm text-destructive">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="mb-4 text-sm text-emerald-400">{actionData.success}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="gap-2" disabled={isSubmitting}>
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
    </Form>
  )
}

// --- Password Form ---
function PasswordInput({ id, name, label, placeholder = "********", minLength }: {
  id: string
  name: string
  label: string
  placeholder?: string
  minLength?: number
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} <span className="text-rose-500">*</span></Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          required
          minLength={minLength}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4 mt-1.5" /> : <Eye className="h-4 w-4 mt-1.5" />}
        </button>
      </div>
    </div>
  )
}

function PasswordForm({
  actionData,
  isSubmitting,
}: {
  actionData: { error?: string; success?: string } | null
  isSubmitting: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)

  if (actionData?.success && formRef.current) {
    formRef.current.reset()
  }

  return (
    <Form method="post" ref={formRef}>
      <input type="hidden" name="intent" value="change-password" />
      <div className="space-y-4">
        <PasswordInput id="currentPassword" name="currentPassword" label="Current Password" />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput id="newPassword" name="newPassword" label="New Password" minLength={8} />
          <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm New Password" minLength={8} />
        </div>

        {actionData?.error && (
          <p className="text-sm text-destructive">{actionData.error}</p>
        )}
        {actionData?.success && (
          <p className="text-sm text-emerald-400">{actionData.success}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            className="border border-primary/50 bg-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>
    </Form>
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
        <p className="text-sm text-muted-foreground">{description}</p>
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

// --- Wallet Section ---
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

function WalletSection({ pendingTopUps, wallet }: { pendingTopUps: TopUpRequest[]; wallet: WalletData }) {
  const fetcher = useFetcher<typeof action>()
  const balance = wallet?.balance ?? 0
  const transactions = wallet?.transactions ?? []
  const [topUpAmount, setTopUpAmount] = useState<number | "">("")
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpStep, setTopUpStep] = useState<"select" | "payment" | "upload">("select")
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const [showExampleSlip, setShowExampleSlip] = useState(false)


  const isSubmitting = fetcher.state !== "idle"
  const fetcherSuccess = fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "topup-request" && "success" in fetcher.data
  const fetcherError = fetcher.data && "intent" in fetcher.data && fetcher.data.intent === "topup-request" && "error" in fetcher.data

  useEffect(() => {
    if (fetcherSuccess) {
      toast.success("Top-up request submitted! Your balance will be updated once approved by admin.")
      resetTopUp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcherSuccess])

  // Generate quick amounts only when user is typing (not after selecting a quick amount)
  const [pickedQuickAmount, setPickedQuickAmount] = useState(false)
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
      case "TOP_UP":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
      case "BOOKING_PAYMENT":
        return <ArrowUpRight className="h-4 w-4 text-orange-400" />
      case "COFFEE_TIP":
        return <Coffee className="h-4 w-4 text-amber-400" />
      case "REFUND":
        return <ArrowDownLeft className="h-4 w-4 text-blue-400" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400"><Clock className="h-3 w-3" />Pending</span>
      case "APPROVED":
        return <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" />Approved</span>
      case "REJECTED":
        return <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"><X className="h-3 w-3" />Rejected</span>
      default:
        return null
    }
  }

  return (
    <>
      <Card className="overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription>Available Balance</CardDescription>
              <CardTitle className="text-3xl sm:text-4xl mt-1">
                {balance.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">Kip</span>
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
                      <DialogDescription>
                        Enter the amount you'd like to add
                      </DialogDescription>
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            Kip
                          </span>
                        </div>
                      </div>

                      {quickAmounts.length > 0 && (
                        <div>
                          <label className="mb-3 block text-sm font-medium text-muted-foreground">Quick amounts</label>
                          <div className="grid grid-cols-2 gap-2">
                            {quickAmounts.map((amount) => (
                              <button
                                key={amount}
                                type="button"
                                onClick={() => { setTopUpAmount(amount); setPickedQuickAmount(true) }}
                                className={cn(
                                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                                  topUpAmount === amount
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {amount.toLocaleString()} Kip
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full gap-2"
                        disabled={!topUpAmount || topUpAmount <= 0}
                        onClick={handleContinue}
                      >
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
                        Scan or download the QR code and pay <span className="font-semibold text-foreground">{Number(topUpAmount).toLocaleString()} Kip</span> using your bank app
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                      {/* QR Code */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
                          <img
                            src="/qr-code.jpeg"
                            alt="Payment QR Code"
                            className="h-48 w-48 object-contain"
                          />
                        </div>
                        <a
                          href="/qr-code.jpeg"
                          download="laodev-qr-code.jpeg"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Download QR Code
                        </a>
                      </div>

                      {/* Instructions */}
                      <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm space-y-2">
                        <p className="font-medium">How to pay:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Download or screenshot the QR code above</li>
                          <li>Open your bank app (BCEL One, LDB, JDB, etc.)</li>
                          <li>Scan the QR code and pay <span className="font-semibold text-foreground">{Number(topUpAmount).toLocaleString()} Kip</span></li>
                          <li>Take a screenshot of your payment confirmation</li>
                          <li>Upload the payment slip in the next step</li>
                        </ol>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setTopUpStep("select")}>
                          Back
                        </Button>
                        <Button className="flex-1" onClick={() => setTopUpStep("upload")}>
                          I've Paid — Upload Slip
                        </Button>
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
                        Upload your payment confirmation for <span className="font-semibold text-foreground">{Number(topUpAmount).toLocaleString()} Kip</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                      {/* Example Payment Slip */}
                      {!slipPreview && <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Example payment slip:</p>
                        <button
                          type="button"
                          onClick={() => setShowExampleSlip(true)}
                          className="group relative overflow-hidden rounded-lg border border-border"
                        >
                          <img
                            src="/payment-slip.jpg"
                            alt="Example payment slip"
                            className="h-24 w-auto object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ZoomIn className="h-5 w-5 text-white" />
                          </div>
                        </button>
                      </div>}

                      {/* Upload Area */}
                      <div className="flex flex-col items-center">
                        {slipPreview ? (
                          <div className="relative w-full">
                            <img
                              src={slipPreview}
                              alt="Payment slip preview"
                              className="mx-auto max-h-64 rounded-lg border border-border object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => { setSlipFile(null); setSlipPreview(null) }}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white"
                            >
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
                              <p className="text-sm text-muted-foreground">JPG, PNG or WebP (max 10MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={handleSlipChange}
                            />
                          </label>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="rounded-lg border border-border bg-secondary/30 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Top-up amount</span>
                          <span className="font-semibold">{Number(topUpAmount).toLocaleString()} Kip</span>
                        </div>
                      </div>

                      {fetcherError && fetcher.data && "error" in fetcher.data && (
                        <p className="text-sm text-destructive">{fetcher.data.error as string}</p>
                      )}

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setTopUpStep("payment")}>
                          Back
                        </Button>
                        <Button
                          className="flex-1 gap-2"
                          disabled={!slipFile || isSubmitting}
                          onClick={handleSubmitTopUp}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
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
                <img
                  src="/payment-slip.jpg"
                  alt="Example payment slip"
                  className="w-full rounded-lg object-contain"
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </div>
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
                <div
                  key={req.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{req.amount.toLocaleString()} Kip</p>
                      <p className="text-sm text-muted-foreground">
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

      {/* How Wallet Works */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </div>
              <div>
                <p className="font-medium">Top up</p>
                <p className="text-sm text-muted-foreground">Pay via QR code and upload slip</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </div>
              <div>
                <p className="font-medium">Book developers</p>
                <p className="text-sm text-muted-foreground">Pay for consultations from your balance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </div>
              <div>
                <p className="font-medium">Give coffee</p>
                <p className="text-sm text-muted-foreground">Tip developers with a coffee as thanks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <History className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-semibold",
                    (tx.type === "TOP_UP" || tx.type === "REFUND") ? "text-emerald-400" : "text-foreground"
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
