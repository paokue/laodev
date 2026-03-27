import { useState } from "react"
import { Form, redirect, useActionData, useNavigation, Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth.server"
import { createAdminSession, getAdmin } from "@/lib/admin-session.server"
import type { Route } from "./+types/login"
import {
  Code2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
} from "lucide-react"

export async function loader({ request }: Route.LoaderArgs) {
  const admin = await getAdmin(request)
  if (admin) throw redirect("/admin")
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = String(formData.get("email")).trim().toLowerCase()
  const password = String(formData.get("password"))

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  })

  if (!admin) {
    return { error: "Invalid email or password" }
  }

  const isValid = await verifyPassword(password, admin.password)
  if (!isValid) {
    return { error: "Invalid email or password" }
  }

  const sessionCookie = await createAdminSession({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  })

  throw redirect("/admin", {
    headers: { "Set-Cookie": sessionCookie },
  })
}

export default function AdminLoginPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute right-1/4 bottom-1/4 h-48 w-48 bg-primary/5 blur-[80px] rounded-full" />
      </div>

      <Card className="relative w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Code2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
              <Shield className="h-3.5 w-3.5" />
              Authorized access only
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form method="post" className="space-y-4">
            {actionData?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@laodev.la"
                  required
                  className="pl-10 bg-background border-border"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  required
                  className="pl-10 pr-10 bg-background border-border"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                "Signing in..."
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-white hover:text-primary transition-colors">
              Back to LaoDev
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
