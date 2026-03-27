import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { useState, useEffect } from "react"
import type { Route } from "./+types/login"
import { Code2, Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader } from "lucide-react"
import { Link, Form, useActionData, useNavigation, useSearchParams, redirect } from "react-router"

// components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { verifyPassword } from "@/lib/auth.server"
import { createSession, getUser } from "@/lib/session.server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Redirect if already logged in
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (user) {
    const to = user.role === "DEVELOPER" ? "/developer" : user.role === "ADMIN" ? "/admin" : "/user"
    throw redirect(to)
  }
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))
  const loginAs = String(formData.get("loginAs") || "USER")

  if (!email || !password) {
    return { error: "Email and password are required", loginAs }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Invalid email or password", loginAs }
  }

  if (!user.emailVerified) {
    return { error: "Please verify your email first. Check your inbox for the OTP code.", loginAs }
  }

  // Validate role matches the selected login tab
  if (loginAs === "DEVELOPER" && user.role !== "DEVELOPER" && user.role !== "ADMIN") {
    return { error: "This account is not registered as a developer. Please use the User login instead.", loginAs }
  }
  if (loginAs === "USER" && user.role !== "USER" && user.role !== "ADMIN") {
    return { error: "This account is not registered as a user. Please use the Developer login instead.", loginAs }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { error: "Invalid email or password", loginAs }
  }

  const cookie = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })

  const redirectTo = user.role === "DEVELOPER" ? "/developer" : user.role === "ADMIN" ? "/admin" : "/user"

  throw redirect(redirectTo, {
    headers: { "Set-Cookie": cookie },
  })
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<"USER" | "DEVELOPER">(
    searchParams.get("as") === "developer" ? "DEVELOPER" : "USER"
  )

  // Sync tab with action response
  useEffect(() => {
    if (actionData && "loginAs" in actionData) {
      setActiveTab(actionData.loginAs === "DEVELOPER" ? "DEVELOPER" : "USER")
    }
  }, [actionData])

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toast.success("Password reset successfully! You can now log in with your new password.")
    }
  }, [searchParams])

  const errorForTab =
    actionData?.error && actionData.loginAs === activeTab ? actionData.error : null

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
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white sm:inline">
              {"Don't"} have an account?
            </span>
            <Link to={activeTab === "DEVELOPER" ? "/register/developer" : "/register/user"}>
              <Button variant="ghost" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-2 sm:px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card py-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Log in to your LaoDev account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Switch */}
            <div className="mb-6 flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setActiveTab("USER")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  activeTab === "USER"
                    ? "bg-background text-foreground shadow-sm border border-primary/50 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-4 w-4" />
                User
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("DEVELOPER")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  activeTab === "DEVELOPER"
                    ? "bg-background text-foreground shadow-sm border border-primary/50 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Code2 className="h-4 w-4" />
                Developer
              </button>
            </div>

            {/* Login Form */}
            <Form method="post" className="space-y-4">
              <input type="hidden" name="loginAs" value={activeTab} />

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
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

              {errorForTab && <p className="text-sm text-destructive">{errorForTab}</p>}

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In as {activeTab === "DEVELOPER" ? "Developer" : "User"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-white">New to LaoDev?</span>
              </div>
            </div>

            {activeTab === "USER" ? (
              <Link to="/register/user" className="block">
                <Button size="lg" variant="outline" className="w-full group gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                  <User className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Create User Account
                </Button>
              </Link>
            ) : (
              <Link to="/register/developer" className="block">
                <Button size="lg" variant="outline" className="w-full group gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                  <Code2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Join as Developer
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
