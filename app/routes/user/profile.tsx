import { useRef, useState } from "react"
import { Form, useFetcher, useActionData, useNavigation } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Loader2,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react"

const bottomBarItems = [
  { href: "/user", label: "Home", icon: Home },
  { href: "/user/bookings", label: "Bookings", icon: Calendar },
  { href: "/developers", label: "Find", icon: Search },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: Users },
]

const topUpPresets = [50, 100, 200, 500, 1000]

const walletTransactions = [
  { id: "1", type: "top_up" as const, amount: 200, description: "Wallet Top-up", date: "Mar 20, 2026" },
  { id: "2", type: "booking" as const, amount: -45, description: "Code Review - Somsak P.", date: "Mar 20, 2026" },
  { id: "3", type: "coffee" as const, amount: -5, description: "Coffee tip - Somsak P.", date: "Mar 20, 2026" },
  { id: "4", type: "top_up" as const, amount: 100, description: "Wallet Top-up", date: "Mar 15, 2026" },
  { id: "5", type: "booking" as const, amount: -82, description: "CI/CD Setup - Thongchanh S.", date: "Mar 15, 2026" },
  { id: "6", type: "top_up" as const, amount: 300, description: "Wallet Top-up", date: "Mar 10, 2026" },
  { id: "7", type: "booking" as const, amount: -50, description: "API Design - Viengkham S.", date: "Mar 10, 2026" },
  { id: "8", type: "coffee" as const, amount: -10, description: "Coffee tip - Viengkham S.", date: "Mar 10, 2026" },
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
      createdAt: true,
      emailVerified: true,
    },
  })

  if (!user) throw new Response("User not found", { status: 404 })

  return { user }
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
      data: { name, email },
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

  return { error: "Invalid action" }
}

// --- Component ---
export default function UserProfilePage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
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
              <WalletSection />
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
                  {[
                    { label: "Booking confirmations", description: "Get notified when your booking is confirmed", enabled: true },
                    { label: "Session reminders", description: "Receive reminders before your sessions", enabled: true },
                    { label: "New messages", description: "Get notified when you receive a message", enabled: true },
                    { label: "Post responses", description: "Get notified when developers respond to your posts", enabled: true },
                    { label: "Promotional emails", description: "Receive updates about new features and offers", enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
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
                  {[
                    { label: "Show profile to developers", description: "Allow developers to see your profile information", enabled: true },
                    { label: "Show online status", description: "Let developers see when you're online", enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
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
                    <Button variant="destructive">Delete Account</Button>
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
  user: { name: string; email: string }
  actionData: { error?: string; success?: string } | null
  isSubmitting: boolean
}) {
  return (
    <Form method="post">
      <input type="hidden" name="intent" value="update-profile" />
      <div className="grid gap-4 sm:grid-cols-2 py-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span className="text-rose-500">*</span></Label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" name="email" type="email" className="pl-9" defaultValue={user.email} required />
          </div>
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

// --- Wallet Section (unchanged from before, UI-only for now) ---
function WalletSection() {
  const [balance, setBalance] = useState(408)
  const [topUpAmount, setTopUpAmount] = useState<number | "">("")
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpStep, setTopUpStep] = useState<"select" | "confirm" | "success">("select")
  const [transactions, setTransactions] = useState(walletTransactions)

  const handleTopUp = () => {
    if (!topUpAmount || topUpAmount <= 0) return
    setTopUpStep("confirm")
  }

  const confirmTopUp = () => {
    const amount = Number(topUpAmount)
    setBalance((prev) => prev + amount)
    setTransactions((prev) => [
      {
        id: String(Date.now()),
        type: "top_up" as const,
        amount,
        description: "Wallet Top-up",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ])
    setTopUpStep("success")
  }

  const resetTopUp = () => {
    setTopUpAmount("")
    setTopUpStep("select")
    setIsTopUpOpen(false)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "top_up":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
      case "booking":
        return <ArrowUpRight className="h-4 w-4 text-orange-400" />
      case "coffee":
        return <Coffee className="h-4 w-4 text-amber-400" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
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
              <DialogContent className="sm:max-w-md">
                {topUpStep === "select" && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Top Up Wallet</DialogTitle>
                      <DialogDescription>
                        Add funds to your wallet to book developers and send coffee tips
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div>
                        <label className="mb-3 block text-sm font-medium">Quick amounts</label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {topUpPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setTopUpAmount(preset)}
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                                topUpAmount === preset
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Or enter custom amount</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min={1}
                            placeholder="Enter amount"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value ? Number(e.target.value) : "")}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            Kip
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2"
                        disabled={!topUpAmount || topUpAmount <= 0}
                        onClick={handleTopUp}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}

                {topUpStep === "confirm" && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Confirm Top-up</DialogTitle>
                      <DialogDescription>
                        Review your top-up details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="rounded-lg border border-border bg-secondary/30 p-6 text-center">
                        <p className="text-sm text-muted-foreground">Amount to add</p>
                        <p className="mt-1 text-3xl font-bold">{Number(topUpAmount).toLocaleString()} Kip</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          New balance: {(balance + Number(topUpAmount)).toLocaleString()} Kip
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Secured by LaoDev payment protection</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setTopUpStep("select")}>
                          Back
                        </Button>
                        <Button className="flex-1" onClick={confirmTopUp}>
                          Confirm Top-up
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {topUpStep === "success" && (
                  <>
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-semibold">Top-up Successful!</h3>
                      <p className="mt-2 text-muted-foreground">
                        {Number(topUpAmount).toLocaleString()} Kip has been added to your wallet
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        New balance: <span className="font-semibold text-foreground">{balance.toLocaleString()} Kip</span>
                      </p>
                      <Button className="mt-6" onClick={resetTopUp}>
                        Done
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </div>
      </Card>

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
                <p className="text-sm text-muted-foreground">Add funds to your wallet anytime</p>
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
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-semibold",
                  tx.amount > 0 ? "text-emerald-400" : "text-foreground"
                )}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount} Kip
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
