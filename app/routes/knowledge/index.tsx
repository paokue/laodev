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
import { prisma } from "@/lib/prisma"
import type { Route } from "./+types/index"

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

export async function loader({ request }: Route.LoaderArgs) {
  const [articles, stats, topContributors] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        excerpt: true,
        category: true,
        tags: true,
        views: true,
        coffeeCount: true,
        readTime: true,
        createdAt: true,
        _count: { select: { comments: true, articleLikes: true } },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            developer: {
              select: { title: true, status: true },
            },
          },
        },
      },
    }),

    Promise.all([
      prisma.walletTransaction.count({ where: { type: "COFFEE_TIP" } }),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.findMany({
        where: { status: "published" },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      prisma.article.aggregate({
        where: { status: "published" },
        _sum: { views: true },
      }),
    ]),

    prisma.walletTransaction.groupBy({
      by: ["walletId"],
      where: { type: "COFFEE_TIP" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ])

  let topContributorsList: Array<{ id: string; name: string; coffeeReceived: number }> = []
  if (topContributors.length > 0) {
    const walletIds = topContributors.map((tc) => tc.walletId)
    const wallets = await prisma.wallet.findMany({
      where: { id: { in: walletIds } },
      select: { id: true, userId: true },
    })
    const userIds = wallets.map((w) => w.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })
    const walletToUser = new Map(wallets.map((w) => [w.id, w.userId]))
    const userMap = new Map(users.map((u) => [u.id, u.name]))
    topContributorsList = topContributors.map((tc) => {
      const userId = walletToUser.get(tc.walletId) || ""
      return { id: userId, name: userMap.get(userId) || "Unknown", coffeeReceived: tc._count.id }
    })
  }

  const [coffeesGiven, articlesPublished, uniqueAuthors, totalViewsAgg] = stats

  const formattedArticles = articles.map((article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || "",
    category: article.category,
    tags: article.tags,
    viewCount: article.views,
    likeCount: article._count.articleLikes,
    coffeeCount: article.coffeeCount,
    commentCount: article._count.comments,
    readTime: article.readTime,
    publishedAt: new Date(article.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    author: {
      id: article.author.id,
      name: article.author.name,
      avatar: article.author.avatar || "",
      title: article.author.developer?.title || "",
      isVerified: article.author.developer?.status === "APPROVED" || article.author.developer?.status === "ACTIVE",
    },
  }))

  return {
    articles: formattedArticles,
    overview: {
      coffeesGiven,
      articlesPublished,
      contributors: uniqueAuthors.length,
      totalReaders: totalViewsAgg._sum.views || 0,
    },
    topContributors: topContributorsList,
  }
}

type ArticleItem = Awaited<ReturnType<typeof loader>>["articles"][number]

function ArticleCard({ article }: { article: ArticleItem }) {
  const initials = article.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Link to={`/knowledge/${article.id}`} className="block">
      <Card className="group relative overflow-hidden border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardContent className="relative px-6 py-3">
          {/* Category */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {article.category}
            </Badge>
          </div>

          {/* Title & Excerpt */}
          <h3 className="font-semibold transition-colors group-hover:text-primary text-lg">
            {article.title}
          </h3>
          <p className="mt-2 text-white line-clamp-2 text-sm">
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

          {/* Stats */}
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

function formatNumber(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return String(num)
}

export default function KnowledgeSharingPage({ loaderData }: Route.ComponentProps) {
  const { articles, overview, topContributors } = loaderData
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

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "All Categories"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="relative pt-12 sm:pt-24">
        {/* Background effects */}
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
                  <span className="text-2xl font-bold">{formatNumber(overview.coffeesGiven)}</span>
                </div>
                <p className="mt-1 text-sm text-white">Coffees Given</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatNumber(overview.articlesPublished)}</span>
                </div>
                <p className="mt-1 text-sm text-white">Articles Published</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatNumber(overview.contributors)}</span>
                </div>
                <p className="mt-1 text-sm text-white">Contributors</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-blue-500">
                  <Lightbulb className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatNumber(overview.totalReaders)}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden border-border"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                <div className="hidden gap-2 lg:flex">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px] border-border bg-card">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:text-white">
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 lg:hidden ${showFilters ? 'max-h-40 mt-4' : 'max-h-0'}`}>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
              <div>
                <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Latest Articles
                </h2>
                <div className="grid gap-6">
                  {sortedArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${index * 0.05}s` }}
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
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-amber-500" />
                    Top Coffee Receivers
                  </h3>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {topContributors.length === 0 && (
                      <p className="text-sm text-white text-center py-2">No coffee tips yet</p>
                    )}
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

              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Share Your Knowledge</h3>
                  <p className="mt-2 text-sm text-white">
                    Are you a developer? Share your expertise and earn coffee from the community.
                  </p>
                  <Link to="/knowledge/write">
                    <Button className="mt-4 w-full gap-2">
                      <Code2 className="h-4 w-4" />
                      Start Writing
                    </Button>
                  </Link>
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
