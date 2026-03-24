import { useState } from "react"
import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/reset-password"
import { Code2, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, XCircle, Loader } from "lucide-react"
import { Link, Form, useActionData, useNavigation, useSearchParams, redirect } from "react-router"

// components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { hashPassword } from "@/lib/auth.server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const token = String(formData.get("token"))
  const password = String(formData.get("password"))
  const confirmPassword = String(formData.get("confirmPassword"))

  if (!token || !password) {
    return { error: "Token and password are required" }
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  })

  if (!user) {
    return { error: "Invalid or expired reset link. Please request a new one." }
  }

  const hashedPassword = await hashPassword(password)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  })

  // Redirect to login with success flag
  throw redirect("/login?reset=success")
}

export default function ResetPasswordPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">LaoDev</span>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {!token && (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Invalid Link</CardTitle>
                <CardDescription>
                  No reset token provided. Please request a new password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/forgot-password">
                  <Button className="w-full gap-2">
                    Request New Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {token && (
            <Card className="border-border bg-card py-16">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Enter your new password below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="token" value={token} />

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a new password (min 8 characters)" className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm your new password" className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader className="h-4 w-4 animate-spin" /> Resetting...</>
                    ) : (
                      <>Reset Password <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
