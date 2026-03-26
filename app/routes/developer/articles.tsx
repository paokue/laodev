import { useState } from "react"
import { Link, useFetcher } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session.server"
import { toast } from "sonner"
import type { Route } from "./+types/articles"
import {
  Calendar,
  MessageSquare,
  FileText,
  Home,
  Users,
  Plus,
  Search,
  Eye,
  Clock,
  MoreVertical,
  Trash2,
  ExternalLink,
  Pencil,
  TrendingUp,
  BookOpen,
  BarChart3,
  Loader,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const categories = [
  "All",
  "Frontend",
  "Backend",
  "DevOps",
  "Mobile",
  "Blockchain",
  "AI/ML",
  "Career",
  "Tutorial",
  "News",
  "Tips & Tricks",
]

// --- Loader ---
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  })

  const articles = await prisma.article.findMany({
    where: { authorId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      category: true,
      tags: true,
      status: true,
      readTime: true,
      views: true,
      createdAt: true,
    },
  })

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0)

  return {
    userName: user?.name ?? "Developer",
    articles,
    totalArticles: articles.length,
    publishedCount: articles.filter((a) => a.status === "published").length,
    draftCount: articles.filter((a) => a.status === "draft").length,
    totalViews,
  }
}

// --- Action ---
export async function action({ request }: Route.ActionArgs) {
  const session = await requireUser(request, ["DEVELOPER", "ADMIN"])
  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "delete-article") {
    const articleId = String(formData.get("articleId"))

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true },
    })

    if (!article || article.authorId !== session.userId) {
      return { error: "Article not found" }
    }

    await prisma.article.delete({ where: { id: articleId } })
    return { success: "Article deleted" }
  }

  return { error: "Invalid action" }
}

// --- Component ---
export default function DeveloperArticlesPage({ loaderData }: Route.ComponentProps) {
  const { userName, articles, totalArticles, publishedCount, draftCount, totalViews } = loaderData
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = articles.filter((article) => {
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = categoryFilter === "All" || article.category === categoryFilter
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userType="developer" userName={userName} />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My <span className="gradient-text">Articles</span>
              </h1>
              <p className="mt-1 text-muted-foreground">Manage your knowledge sharing articles</p>
            </div>
            <Button asChild className="gap-2">
              <Link to="/knowledge/write">
                <Plus className="h-4 w-4" />
                Write Article
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalArticles}</p>
                    <p className="text-xs text-muted-foreground">Total Articles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publishedCount}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{draftCount}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-card/50 pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full border-border bg-card/50 sm:w-[160px]">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border-border bg-card/50 sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Articles List */}
          {filtered.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {totalArticles === 0 ? "No articles yet" : "No matching articles"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {totalArticles === 0
                    ? "Share your knowledge with the community by writing your first article."
                    : "Try adjusting your search or filters."}
                </p>
                {totalArticles === 0 && (
                  <Button asChild className="gap-2">
                    <Link to="/knowledge/write">
                      <Plus className="h-4 w-4" />
                      Write Your First Article
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}

// --- Article Row ---
function ArticleRow({
  article,
}: {
  article: {
    id: string
    title: string
    excerpt: string | null
    category: string
    tags: string[]
    status: string
    readTime: number
    views: number
    createdAt: Date | string
  }
}) {
  const fetcher = useFetcher<typeof action>()
  const isDeleting = fetcher.state !== "idle"

  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  if (isDeleting && fetcher.formData?.get("intent") === "delete-article") {
    return null
  }

  return (
    <Card className="border-border transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  article.status === "published"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }
              >
                {article.status === "published" ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline" className="border-border">
                {article.category}
              </Badge>
            </div>

            <Link
              to={`/knowledge/${article.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                {article.title}
              </h3>
            </Link>

            {article.excerpt && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.views.toLocaleString()} views
              </span>
            </div>

            {article.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/5 text-primary/70 text-[11px] px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card/95 backdrop-blur-xl">
              <DropdownMenuItem asChild>
                <Link to={`/knowledge/${article.id}`} className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Article
                </Link>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{article.title}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => {
                        fetcher.submit(
                          { intent: "delete-article", articleId: article.id },
                          { method: "post" }
                        )
                        toast.success("Article deleted")
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
