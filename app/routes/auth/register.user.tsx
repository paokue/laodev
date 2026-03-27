import { useState } from "react"
import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/register.user"
import { Link, Form, useActionData, useNavigation, redirect } from "react-router"
import { Code2, ArrowRight, ArrowLeft, Mail, User, Lock, Eye, EyeOff, Loader } from "lucide-react"

// components:
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// libs:
import { hashPassword } from "@/lib/auth.server"
import { generateOtp, sendOtpEmail } from "@/lib/mailer"
import { createSession, getUser } from "@/lib/session.server"

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (user) throw redirect("/user")
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "register") {
    const name = String(formData.get("name"))
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))
    const confirmPassword = String(formData.get("confirmPassword"))

    if (!name || !email || !password) {
      return { error: "All fields are required", step: "form" as const }
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters", step: "form" as const }
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match", step: "form" as const }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.emailVerified) {
      return { error: "An account with this email already exists", step: "form" as const }
    }
    if (existingUser && !existingUser.emailVerified && existingUser.role !== "USER") {
      return { error: "This email is already registered as a developer. Please log in instead.", step: "form" as const }
    }

    const hashedPassword = await hashPassword(password)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    if (existingUser && !existingUser.emailVerified) {
      await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword, role: "USER", otpCode: otp, otpExpiry },
      })
    } else {
      await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "USER", emailVerified: false, otpCode: otp, otpExpiry },
      })
    }

    await sendOtpEmail(email, otp, name)
    return { step: "otp" as const, email, name }
  }

  if (intent === "verify-otp") {
    const email = String(formData.get("email"))
    const otp = String(formData.get("otp"))

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.otpCode || !user.otpExpiry) {
      return { error: "Invalid request. Please register again.", step: "form" as const }
    }
    if (new Date() > user.otpExpiry) {
      return { error: "OTP has expired. Please register again.", step: "otp" as const, email }
    }
    if (user.otpCode !== otp) {
      return { error: "Invalid OTP code", step: "otp" as const, email }
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: true, otpCode: null, otpExpiry: null },
    })

    const cookie = await createSession({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    })

    throw redirect("/user", { headers: { "Set-Cookie": cookie } })
  }

  if (intent === "resend-otp") {
    const email = String(formData.get("email"))
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.emailVerified) {
      return { error: "Invalid request", step: "form" as const }
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiry } })
    await sendOtpEmail(email, otp, user.name)

    return { step: "otp" as const, email, message: "OTP resent to your email" }
  }

  return { error: "Invalid request", step: "form" as const }
}

export default function UserRegistrationPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const step = actionData?.step === "otp" ? "otp" : "form"
  const email = actionData && "email" in actionData ? actionData.email : ""

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
            <span className="text-sm text-white">Already have an account?</span>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === "form" ? (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                  Join LaoDev to find and book consultations with developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="register" />

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="name" name="name" placeholder="Enter your full name" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password (min 8 characters)" className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                      <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm your password" className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {actionData?.error && actionData.step === "form" && (
                    <p className="text-sm text-destructive">{actionData.error}</p>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                    <span className="text-sm text-white">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                    </span>
                  </label>

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting || !agreedToTerms}>
                    {isSubmitting ? (
                      <><Loader className="h-4 w-4 animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Account <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </Form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-white">Or</span></div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-center text-sm text-white">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                  </p>
                  <p className="text-center text-sm text-white">
                    Want to offer consultations? <Link to="/register/developer" className="text-primary hover:underline">Join as a Developer</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                  We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="intent" value="verify-otp" />
                  <input type="hidden" name="email" value={email || ""} />

                  <OtpInput />

                  {actionData?.error && actionData.step === "otp" && (
                    <p className="text-sm text-center text-destructive">{actionData.error}</p>
                  )}
                  {"message" in (actionData || {}) && (
                    <p className="text-sm text-center text-emerald-400">{(actionData as { message: string }).message}</p>
                  )}

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader className="h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                      <>Verify Email <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </Form>

                <div className="flex flex-col gap-2 mt-4 text-center">
                  <Form method="post">
                    <input type="hidden" name="intent" value="resend-otp" />
                    <input type="hidden" name="email" value={email || ""} />
                    <p className="text-sm text-white">
                      Didn't receive the code?{" "}
                      <button type="submit" disabled={isSubmitting} className="text-primary hover:underline disabled:opacity-50">
                        Resend OTP
                      </button>
                    </p>
                  </Form>
                  <Link to="/register/user" className="inline-flex items-center justify-center gap-1 text-sm text-white hover:text-white">
                    <ArrowLeft className="h-3 w-3" />
                    Back to registration
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// OTP input component that combines digits into a single hidden field
function OtpInput() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  return (
    <>
      <input type="hidden" name="otp" value={digits.join("")} />
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <Input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-12 text-center text-lg font-semibold"
            autoFocus={index === 0}
          />
        ))}
      </div>
    </>
  )
}
