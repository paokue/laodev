import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import {
  Calendar,
  MessageSquare,
  Camera,
  MapPin,
  Search,
  Home,
  Users,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Bell,
} from "lucide-react"

const bottomBarItems = [
  { href: "/user", label: "Home", icon: Home },
  { href: "/user/bookings", label: "Bookings", icon: Calendar },
  { href: "/developers", label: "Find", icon: Search },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: Users },
]

const paymentMethods = [
  { id: "1", type: "Visa", last4: "4242", expiry: "12/27", isDefault: true },
  { id: "2", type: "Mastercard", last4: "8888", expiry: "03/26", isDefault: false },
]

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="user"
        userName="Khamla Sisavath"
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
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Profile Picture */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-border">
                        <AvatarFallback className="bg-blue-500/10 text-blue-400 text-2xl">
                          KS
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-semibold">Khamla Sisavath</h2>
                      <p className="text-muted-foreground">Member since March 2026</p>
                      <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                        <span className="flex items-center gap-1 text-sm text-emerald-400">
                          <Shield className="h-4 w-4" />
                          Email Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue="Khamla Sisavath" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" defaultValue="khamla@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" defaultValue="+856 20 123 4567" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" defaultValue="Vientiane, Laos" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button variant="outline">Update Password</Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">Save Changes</Button>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              {/* Payment Methods */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment options</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Add Card
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.type} **** {method.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Default
                          </span>
                        )}
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View your past transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Mar 20, 2026", description: "Code Review - Somsak P.", amount: 45 },
                      { date: "Mar 15, 2026", description: "CI/CD Setup - Thongchanh S.", amount: 82 },
                      { date: "Mar 10, 2026", description: "API Design - Viengkham S.", amount: 50 },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <p className="font-semibold">{item.amount} Kip</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>
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
