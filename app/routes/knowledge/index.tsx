import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Coffee,
  Heart,
  MessageSquare,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  SlidersHorizontal,
  BookOpen,
  Lightbulb,
  Code2,
  Users,
} from "lucide-react"
import { Link } from "react-router"

const articles = [
  {
    id: "1",
    title: "Building Scalable APIs with Node.js and TypeScript in 2024",
    excerpt: "Learn how to structure your Node.js APIs for scalability using TypeScript, clean architecture, and best practices from production systems.",
    content: "Full article content here...",
    author: {
      id: "1",
      name: "Somsak Phommavong",
      avatar: "",
      title: "Senior Full-Stack Developer",
      isVerified: true,
    },
    category: "Backend",
    tags: ["Node.js", "TypeScript", "API Design", "Clean Architecture"],
    coffeeCount: 47,
    likeCount: 234,
    commentCount: 28,
    viewCount: 1520,
    readTime: 12,
    publishedAt: "2024-01-15",
    isFeatured: true,
  },
  {
    id: "2",
    title: "React Server Components: A Deep Dive",
    excerpt: "Understanding React Server Components, when to use them, and how they change the way we think about React applications.",
    content: "Full article content here...",
    author: {
      id: "4",
      name: "Vanida Keomany",
      avatar: "",
      title: "UI/UX Designer & Frontend Dev",
      isVerified: true,
    },
    category: "Frontend",
    tags: ["React", "Server Components", "Next.js", "Performance"],
    coffeeCount: 32,
    likeCount: 189,
    commentCount: 15,
    viewCount: 980,
    readTime: 8,
    publishedAt: "2024-01-12",
    isFeatured: false,
  },
  {
    id: "3",
    title: "My Journey: From Junior to Senior Developer in Laos",
    excerpt: "Sharing my 5-year journey of becoming a senior developer in the Laos tech scene, lessons learned, and advice for newcomers.",
    content: "Full article content here...",
    author: {
      id: "5",
      name: "Bounmy Phonethip",
      avatar: "",
      title: "Backend Developer",
      isVerified: true,
    },
    category: "Career",
    tags: ["Career Growth", "Junior Developer", "Mentorship", "Laos Tech"],
    coffeeCount: 89,
    likeCount: 456,
    commentCount: 67,
    viewCount: 3200,
    readTime: 15,
    publishedAt: "2024-01-10",
    isFeatured: true,
  },
  {
    id: "4",
    title: "Docker and Kubernetes for Beginners: A Practical Guide",
    excerpt: "Get started with containerization and orchestration. This guide covers everything you need to deploy your first application.",
    content: "Full article content here...",
    author: {
      id: "3",
      name: "Thongchanh Sisouphon",
      avatar: "",
      title: "DevOps Engineer",
      isVerified: true,
    },
    category: "DevOps",
    tags: ["Docker", "Kubernetes", "DevOps", "Deployment"],
    coffeeCount: 56,
    likeCount: 312,
    commentCount: 34,
    viewCount: 2100,
    readTime: 20,
    publishedAt: "2024-01-08",
    isFeatured: false,
  },
  {
    id: "5",
    title: "Building Your First Smart Contract with Solidity",
    excerpt: "A step-by-step tutorial on creating, testing, and deploying your first Ethereum smart contract using Solidity.",
    content: "Full article content here...",
    author: {
      id: "6",
      name: "Singkham Vongphachanh",
      avatar: "",
      title: "Blockchain Developer",
      isVerified: true,
    },
    category: "Blockchain",
    tags: ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
    coffeeCount: 28,
    likeCount: 145,
    commentCount: 19,
    viewCount: 890,
    readTime: 18,
    publishedAt: "2024-01-05",
    isFeatured: false,
  },
  {
    id: "6",
    title: "Machine Learning Fundamentals for Web Developers",
    excerpt: "An introduction to machine learning concepts that every web developer should know, with practical JavaScript examples.",
    content: "Full article content here...",
    author: {
      id: "7",
      name: "Phetsavanh Souphom",
      avatar: "",
      title: "Data Scientist",
      isVerified: true,
    },
    category: "AI/ML",
    tags: ["Machine Learning", "JavaScript", "TensorFlow.js", "AI"],
    coffeeCount: 41,
    likeCount: 267,
    commentCount: 23,
    viewCount: 1450,
    readTime: 14,
    publishedAt: "2024-01-03",
    isFeatured: true,
  },
]

const categories = [
  "All Categories",
  "Frontend",
  "Backend",
  "DevOps",
  "Mobile",
  "Blockchain",
  "AI/ML",
  "Career",
  "Tutorial",
]

const topContributors = [
  { id: "5", name: "Bounmy Phonethip", coffeeReceived: 234, articles: 12 },
  { id: "1", name: "Somsak Phommavong", coffeeReceived: 189, articles: 8 },
  { id: "3", name: "Thongchanh Sisouphon", coffeeReceived: 156, articles: 15 },
  { id: "7", name: "Phetsavanh Souphom", coffeeReceived: 134, articles: 6 },
  { id: "4", name: "Vanida Keomany", coffeeReceived: 98, articles: 9 },
]

function ArticleCard({ article, featured = false }: { article: typeof articles[0]; featured?: boolean }) {
  const initials = article.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Link to={`/knowledge/${article.id}`} className="block">
      <Card className={`group relative overflow-hidden border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 ${featured ? 'md:col-span-2' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardContent className="relative px-6 py-3">
          {/* Category & Featured Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {article.category}
            </Badge>
            {article.isFeatured && (
              <Badge className="gap-1 bg-amber-500/20 text-amber-400">
                <TrendingUp className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>

          {/* Title & Excerpt */}
          <h3 className={`font-semibold transition-colors group-hover:text-primary ${featured ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
            {article.title}
          </h3>
          <p className={`mt-2 text-white line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`}>
            {article.excerpt}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-white border-border hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-white border-dashed">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Author */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={article.author.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {article.author.name}
                  </span>
                  {article.author.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <span>{article.publishedAt}</span>
                  <span>·</span>
                  <span>{article.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{article.likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{article.commentCount}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-2 border-amber-500/30 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 transition-all">
              <Coffee className="h-4 w-4" />
              <span>{article.coffeeCount}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function KnowledgeSharingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("latest")

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "All Categories" || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "popular") return b.coffeeCount - a.coffeeCount
    if (sortBy === "trending") return b.viewCount - a.viewCount
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const featuredArticles = sortedArticles.filter((a) => a.isFeatured)
  const regularArticles = sortedArticles.filter((a) => !a.isFeatured)

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "All Categories"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="relative pt-12 sm:pt-24">
        {/* Background effects - spans over nav + header */}
        <div className="absolute inset-x-0 top-0 h-[400px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
          <div className="absolute left-1/4 top-0 h-64 w-64 bg-amber-500/10 blur-[100px] rounded-full" />
          <div className="absolute right-1/4 bottom-0 h-48 w-48 bg-primary/10 blur-[80px] rounded-full" />
        </div>

        {/* Header */}
        <div className="relative bg-card/30 overflow-hidden">

          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400 animate-fade-in">
              <Coffee className="mr-1.5 h-3 w-3" />
              Support Developers with Coffee
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl animate-fade-in-up opacity-0 stagger-1">
              Knowledge <span className="gradient-text">Sharing</span>
            </h1>
            <p className="mt-3 max-w-2xl text-white text-lg animate-fade-in-up opacity-0 stagger-2">
              Learn from experienced Laos developers. Read articles, tutorials, and insights shared by our community - and buy them a coffee to show appreciation.
            </p>

            {/* CTA Button */}
            <div className="mt-6 animate-fade-in-up opacity-0 stagger-2">
              <Link to="/knowledge/write">
                <Button className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Start Writing
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8 animate-fade-in-up opacity-0 stagger-3">
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-500">
                  <Coffee className="h-5 w-5" />
                  <span className="text-2xl font-bold">2,847</span>
                </div>
                <p className="mt-1 text-sm text-white">Coffees Given</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-2xl font-bold">{articles.length * 12}</span>
                </div>
                <p className="mt-1 text-sm text-white">Articles Published</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">156</span>
                </div>
                <p className="mt-1 text-sm text-white">Contributors</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-blue-500">
                  <Lightbulb className="h-5 w-5" />
                  <span className="text-2xl font-bold">45K</span>
                </div>
                <p className="mt-1 text-sm text-white">Total Readers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex gap-4 flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search articles, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden border-border"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                {/* Desktop Filters */}
                <div className="hidden gap-2 lg:flex">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px] border-border bg-card">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] border-border bg-card">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="popular">Most Coffees</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-white hover:text-white"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Filters */}
            <div className={`overflow-hidden transition-all duration-300 lg:hidden ${showFilters ? 'max-h-40 mt-4' : 'max-h-0'}`}>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Coffees</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Articles */}
              {featuredArticles.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    Featured Articles
                  </h2>
                  <div className="grid gap-6">
                    {featuredArticles.slice(0, 2).map((article, index) => (
                      <div
                        key={article.id}
                        className="animate-fade-in-up opacity-0"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <ArticleCard article={article} featured />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Articles */}
              <div>
                <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Latest Articles
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {regularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${(index + featuredArticles.length) * 0.05}s` }}
                    >
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </div>

              {sortedArticles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-glow" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
                      <Search className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">No articles found</h3>
                  <p className="mt-2 text-white max-w-sm">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" className="mt-6 gap-2" onClick={clearFilters}>
                    <Sparkles className="h-4 w-4" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden sm:block space-y-6">
              {/* Top Contributors */}
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-amber-500" />
                    Top Coffee Receivers
                  </h3>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <Link
                        key={contributor.id}
                        to={`/developers/${contributor.id}`}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-500">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {contributor.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-amber-500">
                          <Coffee className="h-3.5 w-3.5" />
                          <span>{contributor.coffeeReceived}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="border-b border-border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    Categories
                  </h3>
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(1).map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "secondary"}
                        className={`cursor-pointer transition-all ${selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 hover:bg-primary/20 hover:text-primary"
                          }`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Share Your Knowledge</h3>
                  <p className="mt-2 text-sm text-white">
                    Are you a developer? Share your expertise and earn coffee from the community.
                  </p>
                  <Button className="mt-4 w-full gap-2">
                    <Code2 className="h-4 w-4" />
                    Start Writing
                  </Button>
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
