import { useEffect, useState } from "react"
import { Link, useFetcher, redirect } from "react-router"
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
  Phone,
  Calendar,
  GraduationCap,
  Camera,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth.server"
import { createSession, getUser } from "@/lib/session.server"
import { generateOtp, sendOtpEmail } from "@/lib/mailer"
import { uploadToBunny } from "@/lib/bunny.server"
import type { Route } from "./+types/register.developer"

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (user) throw redirect("/developer")
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  // Step 1: Send OTP only (fast — no DB writes, no file upload)
  if (intent === "register") {
    const name = String(formData.get("name"))
    const email = String(formData.get("email"))

    if (!name || !email) return { error: "Name and email are required" }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.emailVerified) return { error: "An account with this email already exists" }
    if (existing && !existing.emailVerified && existing.role !== "DEVELOPER") {
      return { error: "This email is already registered as a user. Please log in instead." }
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Store OTP temporarily on user record (create minimal or update)
    if (existing) {
      await prisma.user.update({ where: { email }, data: { otpCode: otp, otpExpiry } })
    } else {
      await prisma.user.create({
        data: { name, email, password: "", role: "DEVELOPER", emailVerified: false, otpCode: otp, otpExpiry },
      })
    }

    // Fire and forget — don't wait for email to finish sending
    sendOtpEmail(email, otp, name).catch(console.error)
    return { success: true, intent: "register" }
  }

  // Step 2: Verify OTP + save all data to DB
  if (intent === "verify-otp") {
    const email = String(formData.get("email"))
    const otpValue = String(formData.get("otp"))
    const name = String(formData.get("name"))
    const password = String(formData.get("password"))
    const title = String(formData.get("title"))
    const location = String(formData.get("location"))
    const bio = String(formData.get("bio"))
    const yearsExperience = String(formData.get("yearsExperience"))
    const hourlyRate = String(formData.get("hourlyRate"))
    const gender = String(formData.get("gender"))
    const career = String(formData.get("career"))
    const dob = String(formData.get("dob"))
    const phone = String(formData.get("phone"))
    const profile = String(formData.get("profile") || "")
    const skills = formData.getAll("skills").map(String)
    const avatarFile = formData.get("avatar") as File | null

    // Verify OTP
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.otpCode || !user.otpExpiry) return { error: "Invalid request" }
    if (new Date() > user.otpExpiry) return { error: "OTP has expired" }
    if (user.otpCode !== otpValue) return { error: "Invalid OTP code" }

    // Run heavy ops in parallel
    const [hashedPassword, avatarUrl] = await Promise.all([
      hashPassword(password),
      avatarFile && avatarFile.size > 0 ? uploadToBunny(avatarFile, "avatars") : Promise.resolve(null),
    ])

    const dobDate = new Date(dob)

    // Update user with full data
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role: "DEVELOPER",
        bio,
        phone,
        gender,
        dob: dobDate,
        career,
        avatar: avatarUrl,
        emailVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    })

    // Create developer record
    await prisma.developer.upsert({
      where: { userId: updatedUser.id },
      update: {
        title, skills, hourlyRate: parseFloat(hourlyRate) || 0,
        experience: parseInt(yearsExperience) || 0,
        location, gender, career, dob: dobDate, phone, profile: profile || null,
      },
      create: {
        userId: updatedUser.id, title, specialties: [], skills,
        hourlyRate: parseFloat(hourlyRate) || 0, experience: parseInt(yearsExperience) || 0,
        location, languages: [], gender, career, dob: dobDate, phone, profile: profile || null,
      },
    })

    const cookie = await createSession({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name })
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
  "Vientiane Capital",
  "Vientiane Province",
  "Luang Prabang",
  "Savannakhet",
  "Champasak",
  "Xieng Khouang",
  "Khammouan",
  "Luang Namtha",
  "Oudomxay",
  "Bokeo",
  "Phongsali",
  "Houaphan",
  "Saravane",
  "Sekong",
  "Attapeu",
  "Xayabouly",
  "Bolikhamxai",
  "Xaisomboun",
  "Other",
]

export default function DeveloperRegistrationPage() {
  const fetcher = useFetcher<typeof action>()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const isLoading = fetcher.state !== "idle"
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
    gender: "",
    career: "",
    dob: "",
    phone: "",
    profile: "",
    // Step 3: Skills
    skills: [] as string[],
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [skillSearch, setSkillSearch] = useState("")

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return

    if ("error" in fetcher.data) {
      setError(fetcher.data.error as string)
      return
    }

    if ("intent" in fetcher.data && fetcher.data.intent === "register") {
      setStep(4)
    }
  }, [fetcher.state, fetcher.data])

  const totalSteps = 4

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!avatarFile) {
      setError("Please upload a profile photo")
      return
    }

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
    if (!formData.gender) {
      setError("Please select your gender")
      return
    }
    if (!formData.dob) {
      setError("Please enter your date of birth")
      return
    }
    if (!formData.phone) {
      setError("Please enter your phone number")
      return
    }
    if (!formData.career) {
      setError("Please enter your career/job title")
      return
    }

    setStep(3)
  }

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.skills.length < 3) {
      setError("Please select at least 3 skills")
      return
    }

    const fd = new FormData()
    fd.set("intent", "register")
    fd.set("name", formData.name)
    fd.set("email", formData.email)
    fetcher.submit(fd, { method: "post" })
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

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    const fd = new FormData()
    fd.set("intent", "verify-otp")
    fd.set("otp", otpValue)
    fd.set("name", formData.name)
    fd.set("email", formData.email)
    fd.set("password", formData.password)
    fd.set("title", formData.title)
    fd.set("location", formData.location)
    fd.set("bio", formData.bio)
    fd.set("yearsExperience", formData.yearsExperience)
    fd.set("hourlyRate", formData.hourlyRate)
    fd.set("gender", formData.gender)
    fd.set("career", formData.career)
    fd.set("dob", formData.dob)
    fd.set("phone", formData.phone)
    fd.set("profile", formData.profile)
    formData.skills.forEach((skill) => fd.append("skills", skill))
    if (avatarFile) {
      fd.set("avatar", avatarFile)
    }
    fetcher.submit(fd, { method: "post", encType: "multipart/form-data" })
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
            <span className="text-sm text-white">Already have an account?</span>
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
            <div className="mt-2 flex justify-between text-xs text-white">
              <span>Account</span>
              <span>Profile</span>
              <span>Skills</span>
              <span>Verify</span>
            </div>
          </div>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardContent>
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-border">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Profile" />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {formData.name
                            ? formData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                            : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-1 right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80">
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setAvatarFile(file)
                            setAvatarPreview(URL.createObjectURL(file))
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload profile photo</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
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
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
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
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white"
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
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="w-full flex items-center justify-end">
                    <Button type="submit" className="w-auto gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-center text-sm text-white">
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
              <CardContent>
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Professional Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
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
                      <SelectTrigger className="w-full border border-primary/20">
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
                        <SelectTrigger className="border border-primary/20 w-full mt-2">
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
                        Hourly Rate (Kip) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" >Lak</div>
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
                      className="border border-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gender <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger className="w-full mt-2 border border-primary/20">
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
                      <Label htmlFor="dob">
                        Date of Birth <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dob}
                          onChange={(e) =>
                            setFormData({ ...formData, dob: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="020 XXXX XXXX"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="career">
                        Career <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="career"
                          placeholder="e.g., Software Engineer"
                          value={formData.career}
                          onChange={(e) =>
                            setFormData({ ...formData, career: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile">
                      Profile / Portfolio URL
                    </Label>
                    <Input
                      id="profile"
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.profile}
                      onChange={(e) =>
                        setFormData({ ...formData, profile: e.target.value })
                      }
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
                <CardTitle className="text-xl">Select Your Skills <span className="text-rose-500">*</span></CardTitle>
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
                          className="gap-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
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
                          <p className="px-4 py-2 text-sm text-white">
                            No skills found
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Popular Skills */}
                  <div>
                    <p className="mb-2 text-sm text-white">Popular Skills</p>
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

                  <p className="text-sm text-white">
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
                  <span className="font-medium text-white">{formData.email}</span>
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
                    <p className="text-sm text-white">
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
                    className="w-full text-center text-sm text-white hover:text-white"
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
