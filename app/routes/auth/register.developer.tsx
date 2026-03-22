import { useState } from "react"
import { Link, useNavigate, redirect } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Code2,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  DollarSign,
  X,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth.server"
import { createSession, getUser } from "@/lib/session.server"
import { generateOtp, sendOtpEmail } from "@/lib/mailer"
import type { Route } from "./+types/register.developer"

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (user) throw redirect("/developer")
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "register") {
    const name = String(formData.get("name"))
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))

    if (!name || !email || !password) return { error: "All fields are required" }
    if (password.length < 8) return { error: "Password must be at least 8 characters" }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.emailVerified) return { error: "An account with this email already exists" }

    const hashedPassword = await hashPassword(password)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    if (existing && !existing.emailVerified) {
      await prisma.user.update({ where: { email }, data: { name, password: hashedPassword, role: "DEVELOPER", otpCode: otp, otpExpiry } })
    } else {
      await prisma.user.create({ data: { name, email, password: hashedPassword, role: "DEVELOPER", emailVerified: false, otpCode: otp, otpExpiry } })
    }

    await sendOtpEmail(email, otp, name)
    return { success: true, intent: "register" }
  }

  if (intent === "verify-otp") {
    const email = String(formData.get("email"))
    const otp = String(formData.get("otp"))

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.otpCode || !user.otpExpiry) return { error: "Invalid request" }
    if (new Date() > user.otpExpiry) return { error: "OTP has expired" }
    if (user.otpCode !== otp) return { error: "Invalid OTP code" }

    await prisma.user.update({ where: { email }, data: { emailVerified: true, otpCode: null, otpExpiry: null } })

    const cookie = await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
    throw redirect("/register/developer/pending", { headers: { "Set-Cookie": cookie } })
  }

  if (intent === "resend-otp") {
    const email = String(formData.get("email"))
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.emailVerified) return { error: "Invalid request" }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiry } })
    await sendOtpEmail(email, otp, user.name)
    return { success: true, intent: "resend-otp", message: "OTP resent" }
  }

  return { error: "Invalid request" }
}

const availableSkills = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Flutter",
  "React Native",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "Next.js",
  "Vue.js",
  "Angular",
  "Go",
  "Rust",
  "PHP",
  "Laravel",
  "Django",
  "FastAPI",
  "Figma",
  "UI/UX Design",
  "DevOps",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "Solidity",
]

const locations = [
  "Vientiane",
  "Luang Prabang",
  "Savannakhet",
  "Pakse",
  "Champasak",
  "Xieng Khouang",
  "Phongsali",
  "Luang Namtha",
  "Oudomxay",
  "Other",
]

export default function DeveloperRegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Account
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Profile
    title: "",
    location: "",
    bio: "",
    yearsExperience: "",
    hourlyRate: "",
    // Step 3: Skills
    skills: [] as string[],
  })
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [skillSearch, setSkillSearch] = useState("")

  const totalSteps = 4

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setStep(2)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.location) {
      setError("Please select your location")
      return
    }

    setStep(3)
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.skills.length < 3) {
      setError("Please select at least 3 skills")
      return
    }

    setIsLoading(true)
    const fd = new FormData()
    fd.set("intent", "register")
    fd.set("name", formData.name)
    fd.set("email", formData.email)
    fd.set("password", formData.password)

    const res = await fetch("", { method: "POST", body: fd })
    const result = await res.json()
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }
    setStep(4)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    const fd = new FormData()
    fd.set("intent", "verify-otp")
    fd.set("email", formData.email)
    fd.set("otp", otpValue)

    const res = await fetch("", { method: "POST", body: fd })
    if (res.redirected) {
      navigate(new URL(res.url).pathname)
      return
    }
    const result = await res.json()
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
    }
  }

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill) && formData.skills.length < 10) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
    }
    setSkillSearch("")
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !formData.skills.includes(skill)
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">LaoDev</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Already have an account?</span>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${index + 1 <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                      }`}
                  >
                    {index + 1 < step ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`h-1 w-16 sm:w-24 ${index + 1 < step ? "bg-primary" : "bg-secondary"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Account</span>
              <span>Profile</span>
              <span>Skills</span>
              <span>Verify</span>
            </div>
          </div>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create Developer Account</CardTitle>
                <CardDescription>
                  Join LaoDev and offer your expertise to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Looking for consultations instead?{" "}
                    <Link to="/register/user" className="text-primary hover:underline">
                      Join as a User
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Build Your Profile</CardTitle>
                <CardDescription>
                  Tell us about yourself and your expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Professional Title
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="title"
                        placeholder="e.g., Senior Full-Stack Developer"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        setFormData({ ...formData, location: value })
                      }
                    >
                      <SelectTrigger>
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium">
                        Years of Experience <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        value={formData.yearsExperience}
                        onValueChange={(value) =>
                          setFormData({ ...formData, yearsExperience: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1-2", "3-5", "5-7", "7-10", "10+"].map((years) => (
                            <SelectItem key={years} value={years}>
                              {years} years
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hourlyRate" className="text-sm font-medium">
                        Hourly Rate (USD) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="hourlyRate"
                          type="number"
                          placeholder="45"
                          value={formData.hourlyRate}
                          onChange={(e) =>
                            setFormData({ ...formData, hourlyRate: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                      id="bio"
                      placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Select Your Skills <span className="text-rose-500">*</span></CardTitle>
                <CardDescription>
                  Choose at least 3 skills (max 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStep3Submit} className="space-y-4">
                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          className="gap-1 bg-primary/20 text-primary hover:bg-primary/30"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Search Skills */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                    />
                    {skillSearch && (
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                        {filteredSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                          >
                            {skill}
                          </button>
                        ))}
                        {filteredSkills.length === 0 && (
                          <p className="px-4 py-2 text-sm text-muted-foreground">
                            No skills found
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Popular Skills */}
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Popular Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills
                        .slice(0, 12)
                        .filter((s) => !formData.skills.includes(s))
                        .map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => addSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formData.skills.length}/10 skills selected
                  </p>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending OTP..." : "Continue"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 4: OTP Verification */}
          {step === 4 && (
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verify Your Email <span className="text-rose-500">*</span></CardTitle>
                <CardDescription>
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{formData.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-14 w-12 text-center text-xl font-semibold"
                        required
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-center text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Submit Application"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {"Didn't receive the code? "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        disabled={isLoading}
                      >
                        Resend
                      </button>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    Go back
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
