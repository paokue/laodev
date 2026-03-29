import { useEffect, useState } from "react"
import { useFetcher } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Bell, Shield, CreditCard, Globe, Mail, Loader } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-session.server"
import { toast } from "sonner"
import type { Route } from "./+types/index"

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const settings = await prisma.setting.findMany()
  const map: Record<string, { value: string; type: string; group: string }> = {}
  for (const s of settings) {
    map[s.key] = { value: s.value, type: s.type, group: s.group }
  }

  return { settings: map }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const group = String(formData.get("group"))

  // Get all keys for this group
  const settings = await prisma.setting.findMany({ where: { group } })

  for (const setting of settings) {
    const formValue = formData.get(setting.key)

    let value: string
    if (setting.type === "boolean") {
      // Checkbox/switch: if present in form = "on"/"true", otherwise "false"
      value = formValue === "on" || formValue === "true" ? "true" : "false"
    } else {
      value = formValue !== null ? String(formValue) : setting.value
    }

    await prisma.setting.update({
      where: { key: setting.key },
      data: { value },
    })
  }

  return { success: `${group.charAt(0).toUpperCase() + group.slice(1)} settings saved` }
}

function SettingSwitch({
  settingKey,
  label,
  description,
  defaultChecked,
}: {
  settingKey: string
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/50 p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-white">{description}</p>
      </div>
      <input type="hidden" name={settingKey} value={checked ? "true" : "false"} />
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}

export default function AdminSettingsPage({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
    }
  }, [fetcher.data])

  const get = (key: string, fallback = "") => settings[key]?.value ?? fallback
  const getBool = (key: string) => get(key) === "true"

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-white">Manage platform settings and configurations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post" className="space-y-6">
                <input type="hidden" name="group" value="general" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input id="platformName" name="platformName" defaultValue={get("platformName")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input id="siteUrl" name="siteUrl" defaultValue={get("siteUrl")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Platform Description</Label>
                  <Textarea id="description" name="description" defaultValue={get("description")} rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select name="defaultLanguage" defaultValue={get("defaultLanguage", "en")}>
                      <SelectTrigger className="w-full border border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="lo">Lao</SelectItem>
                        <SelectItem value="th">Thai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select name="timezone" defaultValue={get("timezone", "asia-vientiane")}>
                      <SelectTrigger className="w-full border border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-vientiane">Asia/Vientiane (UTC+7)</SelectItem>
                        <SelectItem value="asia-bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SettingSwitch
                  settingKey="maintenanceMode"
                  label="Maintenance Mode"
                  description="Temporarily disable the platform for maintenance"
                  defaultChecked={getBool("maintenanceMode")}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post" className="space-y-6">
                <input type="hidden" name="group" value="notifications" />
                <div className="space-y-4">
                  <SettingSwitch
                    settingKey="notifyNewDeveloperApps"
                    label="New Developer Applications"
                    description="Get notified when a developer applies"
                    defaultChecked={getBool("notifyNewDeveloperApps")}
                  />
                  <SettingSwitch
                    settingKey="notifyNewBookings"
                    label="New Bookings"
                    description="Get notified for new consultation bookings"
                    defaultChecked={getBool("notifyNewBookings")}
                  />
                  <SettingSwitch
                    settingKey="notifyPaymentAlerts"
                    label="Payment Alerts"
                    description="Receive alerts for payment issues"
                    defaultChecked={getBool("notifyPaymentAlerts")}
                  />
                  <SettingSwitch
                    settingKey="notifyFlaggedContent"
                    label="Flagged Content"
                    description="Get notified when content is flagged"
                    defaultChecked={getBool("notifyFlaggedContent")}
                  />
                  <SettingSwitch
                    settingKey="weeklyReports"
                    label="Weekly Reports"
                    description="Receive weekly platform analytics reports"
                    defaultChecked={getBool("weeklyReports")}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment and payout options</CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post" className="space-y-6">
                <input type="hidden" name="group" value="payments" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency" className="mb-2">Default Currency</Label>
                    <Select name="defaultCurrency" defaultValue={get("defaultCurrency", "LAK")}>
                      <SelectTrigger className="w-full border border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LAK">LAK (Kip)</SelectItem>
                        <SelectItem value="THB">THB (฿)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input id="platformFee" name="platformFee" type="number" defaultValue={get("platformFee", "10")} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minPayoutAmount">Minimum Payout Amount (Kip)</Label>
                    <Input id="minPayoutAmount" name="minPayoutAmount" type="number" defaultValue={get("minPayoutAmount", "50000")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payoutSchedule">Payout Schedule</Label> 
                    <Select name="payoutSchedule" defaultValue={get("payoutSchedule", "weekly")}>
                      <SelectTrigger className="w-full border border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coffeePricePerCup">Coffee Price Per Cup (Kip)</Label>
                  <Input id="coffeePricePerCup" name="coffeePricePerCup" type="number" defaultValue={get("coffeePricePerCup", "20000")} />
                </div>
                <SettingSwitch
                  settingKey="autoPayouts"
                  label="Auto Payouts"
                  description="Automatically process payouts on schedule"
                  defaultChecked={getBool("autoPayouts")}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication options</CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post" className="space-y-6">
                <input type="hidden" name="group" value="security" />
                <SettingSwitch
                  settingKey="twoFactorAuth"
                  label="Two-Factor Authentication"
                  description="Require 2FA for admin accounts"
                  defaultChecked={getBool("twoFactorAuth")}
                />
                <SettingSwitch
                  settingKey="emailVerification"
                  label="Email Verification"
                  description="Require email verification for new accounts"
                  defaultChecked={getBool("emailVerification")}
                />
                <SettingSwitch
                  settingKey="developerVerification"
                  label="Developer Verification"
                  description="Require admin approval for developer accounts"
                  defaultChecked={getBool("developerVerification")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input id="sessionTimeout" name="sessionTimeout" type="number" defaultValue={get("sessionTimeout", "60")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input id="maxLoginAttempts" name="maxLoginAttempts" type="number" defaultValue={get("maxLoginAttempts", "5")} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email templates and SMTP settings</CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post" className="space-y-6">
                <input type="hidden" name="group" value="email" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" name="smtpHost" defaultValue={get("smtpHost")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" name="smtpPort" type="number" defaultValue={get("smtpPort", "587")} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input id="smtpUsername" name="smtpUsername" defaultValue={get("smtpUsername")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input id="smtpPassword" name="smtpPassword" type="password" defaultValue={get("smtpPassword")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input id="fromEmail" name="fromEmail" defaultValue={get("fromEmail")} />
                </div>
                <SettingSwitch
                  settingKey="emailTls"
                  label="Email Encryption (TLS)"
                  description="Use TLS encryption for email delivery"
                  defaultChecked={getBool("emailTls")}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
