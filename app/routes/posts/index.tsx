import { useState } from "react"
import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/index"
import { Link, useLoaderData } from "react-router"

// components
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  X,
  Plus,
  Clock,
  Users,
  Search,
  Sparkles,
  FileText,
  Briefcase,
  DollarSign,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react"

// Helper to format relative time
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? "s" : ""} ago`
}

export async function loader({ request }: Route.LoaderArgs) {
  const dbPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  })

  const posts = dbPosts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.content,
    author: post.author.name,
    budget: post.budget || "",
    skills: post.tags,
    responses: post._count.comments,
    createdAt: timeAgo(post.createdAt),
    type: post.type || "project",
  }))

  const totalPosts = await prisma.post.count()
  const totalComments = await prisma.comment.count()

  return { posts, totalPosts, totalComments }
}

const categories = [
  { value: "all", label: "All Posts" },
  { value: "project", label: "Projects" },
  { value: "mentorship", label: "Mentorship" },
  { value: "consultation", label: "Consultation" },
]

const skills = [
  "All Skills",
  "React",
  "React Native",
  "Node.js",
  "Python",
  "AWS",
  "Mobile",
  "Web Design",
  "DevOps",
  "Shopify",
  "E-commerce",
  "Data Science",
]

export default function PostsPage() {
  const { posts, totalPosts, totalComments } = useLoaderData<typeof loader>()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSkill, setSelectedSkill] = useState("All Skills")
  const [showFilters, setShowFilters] = useState(false)

  const stats = [
    { label: "Active Posts", value: totalPosts, icon: FileText },
    { label: "Total Responses", value: totalComments, icon: MessageSquare },
    { label: "Success Rate", value: "94%", icon: TrendingUp },
  ]

  const filteredPosts = posts.filter((post: typeof posts[number]) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || post.type === selectedCategory

    const matchesSkill =
      selectedSkill === "All Skills" ||
      post.skills.some((skill) =>
        skill.toLowerCase().includes(selectedSkill.toLowerCase())
      )

    return matchesSearch && matchesCategory && matchesSkill
  })

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedSkill("All Skills")
  }

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedSkill !== "All Skills"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="relative pt-12 sm:pt-24">
        {/* Background effects - spans over nav + header */}
        <div className="absolute inset-x-0 top-0 h-[400px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
          <div className="absolute left-1/4 top-0 h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute right-1/4 bottom-0 h-48 w-48 bg-emerald-500/10 blur-[80px] rounded-full" />
        </div>

        {/* Header */}
        <div className="relative bg-card/30 overflow-hidden">

          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/30 animate-fade-in">
                  <FileText className="mr-1.5 h-3 w-3" />
                  {posts.length}+ Active Posts
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl animate-fade-in-up opacity-0 stagger-1">
                  Find Your Next <span className="gradient-text">Project</span>
                </h1>
                <p className="mt-3 max-w-2xl text-white text-lg animate-fade-in-up opacity-0 stagger-2">
                  Browse projects, mentorship opportunities, and consultation requests from users across Laos
                </p>
              </div>

              <Link to="/posts/create" className="hidden sm:block animate-fade-in-up opacity-0 stagger-3">
                <Button size="sm" className="gap-2 glow-sm hover:glow transition-all border border-primary bg-primary/10 text-primary/50 hover:bg-primary/20 hover:text-primary">
                  <Plus className="h-4 w-4 animate-bounce" />
                  Create Post
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 animate-fade-in-up opacity-0 stagger-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-md border border-primary/20 bg-card/50 backdrop-blur-sm p-2 sm:p-4"
                >
                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-white">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex gap-4 flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search posts by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm pl-9 bg-card border-border focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden border-border"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {(searchQuery ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0) + (selectedSkill !== "All Skills" ? 1 : 0)}
                    </span>
                  )}
                </Button>

                {/* Desktop Filters */}
                <div className="hidden gap-2 lg:flex">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[140px] border-border bg-card">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-[140px] border-border bg-card">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {skills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Expanded */}
            <div className={`overflow-hidden transition-all duration-300 lg:hidden ${showFilters ? 'max-h-40 mt-4' : 'max-h-0'}`}>
              <div className="flex flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {skills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Category: {categories.find(c => c.value === selectedCategory)?.label}
                    <button onClick={() => setSelectedCategory("all")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedSkill !== "All Skills" && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Skill: {selectedSkill}
                    <button onClick={() => setSelectedSkill("All Skills")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts List */}
        <div className="mx-auto max-w-7xl px-4 py-2 sm:py-8 lg:px-8">
          <div className="mb-6 hidden sm:flex items-center justify-between">
            <p className="text-sm text-white">
              Showing <span className="font-medium text-white">{filteredPosts.length}</span> post
              {filteredPosts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-glow" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
                  <Search className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-semibold">No posts found</h3>
              <p className="mt-2 text-white max-w-sm">
                Try adjusting your search or filters to find what you&apos;re looking for
              </p>
              <Button
                variant="outline"
                className="mt-6 gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                onClick={clearFilters}
              >
                <Sparkles className="h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <Card
                  key={post.id}
                  className="group transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              post.type === "project"
                                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                                : post.type === "mentorship"
                                  ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                                  : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                            }
                          >
                            {post.type === "project" && <Briefcase className="mr-1 h-3 w-3" />}
                            {post.type === "mentorship" && <Users className="mr-1 h-3 w-3" />}
                            {post.type === "consultation" && <MessageSquare className="mr-1 h-3 w-3" />}
                            {post.type}
                          </Badge>
                          <span className="flex items-center gap-1 text-sm text-white">
                            <Clock className="h-3.5 w-3.5" />
                            {post.createdAt}
                          </span>
                        </div>

                        <Link to={`/posts/${post.id}`}>
                          <h3 className="mt-3 text-xl font-semibold transition-colors group-hover:text-primary">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="mt-2 line-clamp-2 text-white">
                          {post.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-secondary/50">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-border">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {post.author[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-white">
                              {post.author}
                            </span>
                          </div>
                          {post.budget &&
                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                              <DollarSign className="h-4 w-4" />
                              {post.budget}
                            </div>
                          }
                          <div className="flex items-center gap-1 text-sm text-white">
                            <MessageSquare className="h-4 w-4" />
                            {post.responses} responses
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/posts/${post.id}`} className="flex-1 lg:flex-none">
                          <Button size="sm" variant="outline" className="group gap-2 px-8 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                            View Details
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
                          </Button>
                        </Link>
                        <a href="https://wa.me/8562078856194" target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                          <Button size="sm" className="w-full glow-sm hover:glow transition-all gap-1.5">
                            <MessageCircle className="h-3 w-3" />
                            Contact
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Link to="/posts/create" className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Button size="icon" className="px-3 h-10 w-auto rounded-lg shadow-lg shadow-primary/30 glow hover:glow-lg transition-all">
          <Plus className="h-6 w-6" /> Create
        </Button>
      </Link>

      <Footer />
    </div>
  )
}
