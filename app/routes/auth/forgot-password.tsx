import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/forgot-password"
import { Link, Form, useActionData, useNavigation } from "react-router"
import { Code2, Mail, ArrowLeft, ArrowRight, CheckCircle2, Loader } from "lucide-react"

// components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateResetToken } from "@/lib/auth.server"
import { sendResetPasswordEmail } from "@/lib/mailer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = String(formData.get("email"))

  if (!email) {
    return { error: "Email is required" }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "No account found with this email" }
  }

  const resetToken = generateResetToken()
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  })

  await sendResetPasswordEmail(email, resetToken, user.name)

  return { success: true }
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

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

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          {actionData && "success" in actionData ? (
            <Card className="border-border bg-card py-16">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to your email. Please check your inbox and spam folder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/login">
                  <Button variant="outline" className="w-full gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card py-12">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                    </div>
                  </div>

                  {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader className="h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </Form>

                <div className="text-sm mt-6 text-center">
                  Remember your password?&nbsp;
                  <Link to="/login" className="text-sm text-primary underline">Log in</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
