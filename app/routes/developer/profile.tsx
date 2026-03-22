import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import {
  Calendar,
  MessageSquare,
  FileText,
  Camera,
  MapPin,
  Briefcase,
  Star,
  Plus,
  X,
  Home,
  Users,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Shield,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const skills = ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker", "GraphQL", "Next.js"]

const services = [
  { id: "1", name: "Code Review", price: 45, duration: "1 hour", description: "In-depth review of your codebase with detailed feedback" },
  { id: "2", name: "Career Mentorship", price: 35, duration: "45 mins", description: "Career guidance and professional development advice" },
  { id: "3", name: "Architecture Review", price: 75, duration: "1.5 hours", description: "System design and architecture consultation" },
]

export default function DeveloperProfilePage() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [currentSkills, setCurrentSkills] = useState(skills)
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setCurrentSkills([...currentSkills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName="Somsak Phommavong"
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your public profile and services
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
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
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          SP
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
                      <h2 className="text-xl font-semibold">Somsak Phommavong</h2>
                      <p className="text-muted-foreground">Senior Full-Stack Developer</p>
                      <div className="mt-2 flex items-center justify-center gap-4 sm:justify-start">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">4.9</span>
                          <span className="text-muted-foreground">(47 reviews)</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Shield className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue="Somsak Phommavong" />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input defaultValue="Senior Full-Stack Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" defaultValue="Vientiane, Laos" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" type="number" defaultValue="8" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      rows={4}
                      defaultValue="Passionate full-stack developer with 8+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud infrastructure. I love helping others learn and grow in their development journey."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Add skills to help clients find you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {currentSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 px-3 py-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input placeholder="https://yourwebsite.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </Label>
                      <Input placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Services</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </div>

              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            <span className="font-medium text-primary">{service.price} Kip</span>
                            <span className="text-muted-foreground">{service.duration}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Hourly Rate */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Default Hourly Rate</CardTitle>
                  <CardDescription>Used when clients book custom sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="45" className="w-24" />
                    <span className="text-muted-foreground">Kip per hour</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Availability */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Control when clients can book you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Available for Bookings</p>
                      <p className="text-sm text-muted-foreground">
                        {isAvailable
                          ? "Your profile is visible and clients can book sessions"
                          : "Your profile is hidden from search results"}
                      </p>
                    </div>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={setIsAvailable}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "New booking requests", description: "Get notified when someone books a session", enabled: true },
                    { label: "New messages", description: "Get notified when you receive a message", enabled: true },
                    { label: "Consultation requests", description: "Get notified about new project posts", enabled: false },
                    { label: "Weekly summary", description: "Receive a weekly summary of your activity", enabled: true },
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

              {/* Preview */}
              <Card className="border-border border-dashed">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">Preview Your Profile</p>
                    <p className="text-sm text-muted-foreground">See how clients view your profile</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
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
