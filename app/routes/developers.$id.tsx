import { Link, useParams } from "react-router"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewModal } from "@/components/review-modal"
import {
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ArrowLeft,
  PenLine,
  Coffee,
  Sparkles,
} from "lucide-react"

const defaultAvatar = "https://xaosao-local.b-cdn.net/1771560713462-376.jpg"

// Mock data - in real app this would come from database
function createDeveloper(id: string) {
  const devData: Record<string, { name: string; title: string; location: string; skills: string[]; rating: number; reviewCount: number; hourlyRate: number; yearsExperience: number; isAvailable: boolean; bio: string }> = {
    "1": {
      name: "Somsak Phommavong",
      title: "Senior Full-Stack Developer",
      location: "Vientiane, Laos",
      skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "GraphQL", "Docker", "Redis"],
      rating: 4.9, reviewCount: 47, hourlyRate: 45, yearsExperience: 8, isAvailable: true,
      bio: "Passionate full-stack developer with 8+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud architecture. I love mentoring junior developers and helping startups bring their ideas to life.",
    },
    "2": {
      name: "Keo Bounyavong",
      title: "Mobile App Developer",
      location: "Luang Prabang, Laos",
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase", "TypeScript"],
      rating: 4.8, reviewCount: 32, hourlyRate: 40, yearsExperience: 6, isAvailable: true,
      bio: "Mobile-first developer with deep expertise in cross-platform development. I've built and shipped 20+ apps on both App Store and Google Play. Passionate about creating smooth, performant mobile experiences.",
    },
    "3": {
      name: "Thongchanh Sisouphon",
      title: "DevOps Engineer",
      location: "Savannakhet, Laos",
      skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "AWS", "Ansible"],
      rating: 5.0, reviewCount: 28, hourlyRate: 55, yearsExperience: 10, isAvailable: false,
      bio: "Infrastructure and DevOps specialist with 10+ years keeping systems running at scale. I help teams adopt modern CI/CD practices, containerization, and cloud-native architectures.",
    },
    "4": {
      name: "Vanida Keomany",
      title: "UI/UX Designer & Frontend Dev",
      location: "Vientiane, Laos",
      skills: ["Figma", "React", "Tailwind CSS", "Next.js", "Framer Motion", "Adobe XD"],
      rating: 4.7, reviewCount: 23, hourlyRate: 35, yearsExperience: 5, isAvailable: true,
      bio: "Design-minded frontend developer who bridges the gap between design and code. I create beautiful, accessible interfaces that users love. Strong background in design systems and component libraries.",
    },
    "5": {
      name: "Bounmy Phonethip",
      title: "Backend Developer",
      location: "Pakse, Laos",
      skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "GraphQL"],
      rating: 4.9, reviewCount: 41, hourlyRate: 42, yearsExperience: 7, isAvailable: true,
      bio: "Backend engineer focused on building robust, scalable APIs. I have deep experience with Python ecosystems and database optimization. I enjoy solving complex data problems.",
    },
    "6": {
      name: "Singkham Vongphachanh",
      title: "Blockchain Developer",
      location: "Vientiane, Laos",
      skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "DeFi", "Rust"],
      rating: 4.6, reviewCount: 15, hourlyRate: 60, yearsExperience: 4, isAvailable: true,
      bio: "Web3 and blockchain developer specializing in smart contract development and DeFi protocols. I help projects launch secure, audited smart contracts on EVM-compatible chains.",
    },
    "7": {
      name: "Phetsavanh Souphom",
      title: "Data Scientist",
      location: "Vientiane, Laos",
      skills: ["Python", "TensorFlow", "Machine Learning", "SQL", "Pandas", "PyTorch"],
      rating: 4.8, reviewCount: 19, hourlyRate: 50, yearsExperience: 5, isAvailable: true,
      bio: "Data scientist with experience in machine learning, NLP, and computer vision. I help companies extract insights from data and build ML-powered products.",
    },
    "8": {
      name: "Chanthavong Saiyasith",
      title: "Cloud Architect",
      location: "Luang Prabang, Laos",
      skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Serverless"],
      rating: 4.9, reviewCount: 36, hourlyRate: 65, yearsExperience: 9, isAvailable: false,
      bio: "Cloud architect with multi-cloud expertise. I design and implement scalable, cost-effective cloud infrastructure for startups and enterprises alike.",
    },
    "9": {
      name: "Malivan Douangmala",
      title: "Frontend Developer",
      location: "Vientiane, Laos",
      skills: ["Vue.js", "Nuxt", "TypeScript", "Tailwind CSS", "GraphQL", "Pinia"],
      rating: 4.7, reviewCount: 28, hourlyRate: 38, yearsExperience: 4, isAvailable: true,
      bio: "Frontend developer specializing in Vue.js ecosystem. I build performant, SEO-friendly web applications with clean, maintainable code.",
    },
  }

  const data = devData[id] || devData["1"]

  return {
    id,
    name: data.name,
    avatar: defaultAvatar,
    title: data.title,
    location: data.location,
    bio: data.bio,
    skills: data.skills,
    rating: data.rating,
    reviewCount: data.reviewCount,
    hourlyRate: data.hourlyRate,
    yearsExperience: data.yearsExperience,
    isVerified: true,
    isAvailable: data.isAvailable,
    languages: ["Lao", "English", "Thai"],
    responseTime: "Usually responds within 2 hours",
    completedProjects: Math.floor(Math.random() * 100) + 50,
    experience: [
      {
        company: "TechLao Solutions",
        role: "Lead Developer",
        period: "2020 - Present",
        description: "Leading a team of developers building enterprise solutions.",
      },
      {
        company: "StartupVientiane",
        role: data.title,
        period: "2017 - 2020",
        description: "Built and maintained multiple products from scratch.",
      },
      {
        company: "Freelance",
        role: "Developer",
        period: "2015 - 2017",
        description: "Worked with various clients on custom applications.",
      },
    ],
    education: [
      {
        school: "National University of Laos",
        degree: "Bachelor of Computer Science",
        year: "2015",
      },
    ],
    reviews: [
      {
        id: "1",
        author: "Bounhome K.",
        rating: 5,
        date: "2 weeks ago",
        content: `${data.name} was incredibly helpful in guiding our team. Their expertise and patience made a huge difference.`,
      },
      {
        id: "2",
        author: "Viengkham T.",
        rating: 5,
        date: "1 month ago",
        content: "Great mentor! Helped me understand complex concepts and how to structure my project properly.",
      },
      {
        id: "3",
        author: "Manivanh S.",
        rating: 4,
        date: "2 months ago",
        content: "Very knowledgeable developer. The consultation was valuable and I learned a lot.",
      },
    ],
    availability: [
      { day: "Monday", slots: ["9:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Tuesday", slots: ["10:00 AM", "3:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM"] },
      { day: "Thursday", slots: ["10:00 AM", "4:00 PM"] },
      { day: "Friday", slots: ["9:00 AM", "1:00 PM", "3:00 PM"] },
    ],
  }
}

export default function DeveloperProfilePage() {
  const { id } = useParams()
  const developer = createDeveloper(id!)

  const initials = developer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="relative pt-24">
        {/* Background effects */}
        <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
          <div className="absolute left-1/4 top-0 h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute right-1/4 bottom-0 h-48 w-48 bg-emerald-500/10 blur-[80px] rounded-full" />
        </div>

        {/* Back Link */}
        <div className="relative mx-auto max-w-7xl px-4 py-4 lg:px-8">
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Developers
          </Link>
        </div>

        {/* Profile Header */}
        <div className="relative border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-primary/30 shadow-xl shadow-primary/10">
                    <AvatarImage src={developer.avatar} alt={developer.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-2xl text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {developer.isVerified && (
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/50">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold sm:text-3xl animate-fade-in-up opacity-0 stagger-1">{developer.name}</h1>
                    {developer.isAvailable ? (
                      <Badge className="gap-1 bg-emerald-500/20 text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">Busy</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-lg text-muted-foreground">{developer.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary/60" />
                      <span>{developer.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary/60" />
                      <span>{developer.yearsExperience}+ years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium text-foreground">{developer.rating.toFixed(1)}</span>
                      <span>({developer.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {developer.skills.slice(0, 6).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="font-normal border border-primary/50 bg-primary/20 hover:text-primary"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {developer.skills.length > 6 && (
                      <Badge variant="outline" className="text-muted-foreground border-dashed">
                        +{developer.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-center md:text-right">
                  <div className="flex items-center gap-2 md:justify-end">
                    <Coffee className="h-5 w-5 text-amber-500" />
                    <span className="text-3xl font-bold text-primary">{developer.hourlyRate} Kip</span>
                    <span className="text-muted-foreground">/coffee</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link to={`/book/${developer.id}`}>
                    <Button size="lg" className="w-full gap-2 sm:w-auto glow hover:glow-lg transition-all">
                      <Calendar className="h-4 w-4" />
                      Book Consultation
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start bg-card/50 border border-border">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                  <Card className="border-border bg-card/50">
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-muted-foreground">
                        {developer.bio}
                      </p>

                      <div className="mt-6">
                        <h4 className="font-semibold">Skills</h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {developer.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="font-normal border border-primary/50 bg-primary/20 hover:text-primary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold">Languages</h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {developer.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="border-border">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="mt-6">
                  <Card className="border-border bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {developer.experience.map((exp, index) => (
                          <div
                            key={index}
                            className="relative border-l-2 border-primary/30 pl-6"
                          >
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                            <h4 className="font-semibold">{exp.role}</h4>
                            <p className="text-sm text-primary">{exp.company}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{exp.period}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6 border-border bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {developer.education.map((edu, index) => (
                          <div key={index}>
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <p className="text-sm text-muted-foreground">
                              {edu.school} - {edu.year}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card className="border-border bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span>Reviews</span>
                          <div className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            {developer.rating.toFixed(1)} ({developer.reviewCount})
                          </div>
                        </div>
                        <ReviewModal
                          developerName={developer.name}
                          developerId={developer.id}
                        >
                          <Button size="sm" className="gap-2">
                            <PenLine className="h-4 w-4" />
                            Write a Review
                          </Button>
                        </ReviewModal>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {developer.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-border pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-border">
                                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                    {review.author[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{review.author}</p>
                                  <p className="text-sm text-muted-foreground">{review.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                              {review.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {developer.availability.slice(0, 3).map((day) => (
                      <div key={day.day}>
                        <p className="text-sm font-medium">{day.day}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {day.slots.map((slot) => (
                            <Badge key={slot} variant="outline" className="text-xs border-border hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to={`/book/${developer.id}`}>
                    <Button className="mt-6 w-full gap-2 glow-sm hover:glow transition-all">
                      <Sparkles className="h-4 w-4" />
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Projects Completed</span>
                      <span className="font-semibold text-primary">{developer.completedProjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="font-semibold">~2 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-semibold text-emerald-400">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Languages</span>
                      <span className="font-semibold">{developer.languages.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
