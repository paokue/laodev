import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { useFetcher, useSearchParams } from "react-router"
import { useState, useEffect, useCallback } from "react"
import type { Route } from "./+types/index"
import { requireAdmin } from "@/lib/admin-session.server"
import { timeAgo } from "@/utils/functions"

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable, Column, FilterOption, type ServerParams } from "@/components/admin/data-table"

import {
  MoreHorizontal,
  Eye,
  Trash2,
  Flag,
  CheckCircle2,
  EyeOff,
  MessageSquare,
  Heart,
  BookOpen,
  ExternalLink,
  Coffee,
  Clock,
} from "lucide-react"

interface Article {
  id: string
  title: string
  authorName: string
  authorAvatar: string | null
  category: string
  status: string
  tags: string[]
  views: number
  likes: number
  coffeeCount: number
  commentCount: number
  readTime: number
  createdAt: string
}

const PAGE_SIZE = 10

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return (
        <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Published
        </Badge>
      )
    case "hidden":
      return (
        <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 text-orange-500">
          <EyeOff className="mr-1 h-3 w-3" />
          Hidden
        </Badge>
      )
    case "flagged":
      return (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
          <Flag className="mr-1 h-3 w-3" />
          Flagged
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const statusFilter = url.searchParams.get("status") || ""
  const categoryFilter = url.searchParams.get("category") || ""
  const dateFrom = url.searchParams.get("dateFrom") || ""
  const dateTo = url.searchParams.get("dateTo") || ""
  const sortKey = url.searchParams.get("sortKey") || ""
  const sortDir = url.searchParams.get("sortDir") || "asc"
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { author: { name: { contains: search, mode: "insensitive" } } },
    ]
  }

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter
  }

  if (categoryFilter && categoryFilter !== "all") {
    where.category = categoryFilter
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
    if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59.999Z")
  }

  // Build orderBy
  let orderBy: Record<string, unknown> = { createdAt: "desc" }
  if (sortKey) {
    const dir = sortDir === "desc" ? "desc" : "asc"
    if (["title", "views", "likes", "coffeeCount", "createdAt", "status", "category"].includes(sortKey)) {
      orderBy = { [sortKey]: dir }
    }
  }

  const [articles, totalCount, totalAll, publishedCount, hiddenCount, flaggedCount] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        tags: true,
        views: true,
        likes: true,
        coffeeCount: true,
        readTime: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "hidden" } }),
    prisma.article.count({ where: { status: "flagged" } }),
  ])

  // Get distinct categories for filter
  const categories = await prisma.article.findMany({
    distinct: ["category"],
    select: { category: true },
  })

  return {
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      authorName: a.author.name,
      authorAvatar: a.author.avatar,
      category: a.category,
      status: a.status || "published",
      tags: a.tags,
      views: a.views,
      likes: a.likes,
      coffeeCount: a.coffeeCount,
      commentCount: a._count.comments,
      readTime: a.readTime,
      createdAt: timeAgo(new Date(a.createdAt)),
    })),
    totalCount,
    totalAll,
    publishedCount,
    hiddenCount,
    flaggedCount,
    categories: categories.map((c) => c.category),
    params: {
      search,
      status: statusFilter,
      category: categoryFilter,
      dateFrom,
      dateTo,
      sortKey,
      sortDir,
      page,
    },
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  const formData = await request.formData()
  const intent = String(formData.get("intent"))
  const articleId = String(formData.get("articleId"))

  if (!articleId) return { error: "Article ID is required" }

  if (intent === "hide") {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "hidden" },
    })
    return { success: "Article hidden" }
  }

  if (intent === "unhide") {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "published" },
    })
    return { success: "Article published" }
  }

  if (intent === "flag") {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "flagged" },
    })
    return { success: "Article flagged" }
  }

  if (intent === "unflag") {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "published" },
    })
    return { success: "Article unflagged" }
  }

  if (intent === "delete") {
    // Delete likes, comments, then article
    await prisma.articleLike.deleteMany({ where: { articleId } })
    await prisma.articleComment.deleteMany({ where: { articleId } })
    await prisma.article.delete({ where: { id: articleId } })
    return { success: "Article deleted" }
  }

  return { error: "Invalid action" }
}

export default function AdminKnowledgePage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showHideDialog, setShowHideDialog] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const fetcher = useFetcher<typeof action>()

  const { articles: localArticles, totalCount, totalAll, publishedCount, hiddenCount, flaggedCount, categories, params } = loaderData

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedArticle(null)
      setShowDeleteDialog(false)
      setShowHideDialog(false)
      setShowFlagDialog(false)
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleAction = (intent: string) => {
    if (selectedArticle) {
      fetcher.submit({ intent, articleId: selectedArticle.id }, { method: "post" })
    }
  }

  const handleParamsChange = useCallback((p: ServerParams) => {
    const sp = new URLSearchParams()
    if (p.search) sp.set("search", p.search)
    if (p.filters.status && p.filters.status !== "all") sp.set("status", p.filters.status)
    if (p.filters.category && p.filters.category !== "all") sp.set("category", p.filters.category)
    if (p.sort) {
      sp.set("sortKey", p.sort.key)
      sp.set("sortDir", p.sort.direction)
    }
    if (p.page > 1) sp.set("page", String(p.page))
    if (p.filters.dateFrom) sp.set("dateFrom", p.filters.dateFrom)
    if (p.filters.dateTo) sp.set("dateTo", p.filters.dateTo)
    setSearchParams(sp)
  }, [setSearchParams])

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "published", label: "Published" },
        { value: "hidden", label: "Hidden" },
        { value: "flagged", label: "Flagged" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: categories.map((c) => ({ value: c, label: c })),
    },
    {
      key: "date",
      label: "Created Date",
      type: "dateRange" as const,
      options: [],
    },
  ]

  const renderDropdownActions = (article: Article) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(`/knowledge/${article.id}`, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View Detail
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {article.status === "hidden" ? (
          <DropdownMenuItem onClick={() => { fetcher.submit({ intent: "unhide", articleId: article.id }, { method: "post" }) }}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => { setSelectedArticle(article); setShowHideDialog(true) }}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide Article
          </DropdownMenuItem>
        )}
        {article.status === "flagged" ? (
          <DropdownMenuItem onClick={() => { fetcher.submit({ intent: "unflag", articleId: article.id }, { method: "post" }) }}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Unflag
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => { setSelectedArticle(article); setShowFlagDialog(true) }}>
            <Flag className="mr-2 h-4 w-4" />
            Flag Article
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => { setSelectedArticle(article); setShowDeleteDialog(true) }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns: Column<Article>[] = [
    {
      key: "authorName",
      label: "Author",
      sortable: true,
      render: (article) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {article.authorAvatar ? <AvatarImage src={article.authorAvatar} /> : null}
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {article.authorName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{article.authorName}</span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Article",
      sortable: true,
      render: (article) => (
        <div className="max-w-[250px]">
          <p className="truncate font-medium">{article.title}</p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-white">
            <Clock className="h-3 w-3" />
            {article.readTime} min read
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (article) => <Badge variant="secondary">{article.category}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (article) => getStatusBadge(article.status),
    },
    {
      key: "views",
      label: "Views",
      sortable: true,
      render: (article) => (
        <span className="text-white">{article.views}</span>
      ),
    },
    {
      key: "likes",
      label: "Likes",
      sortable: true,
      render: (article) => (
        <div className="flex items-center gap-1 text-white">
          <Heart className="h-3.5 w-3.5" />
          {article.likes}
        </div>
      ),
    },
    {
      key: "coffeeCount",
      label: "Coffees",
      sortable: true,
      render: (article) => (
        <div className="flex items-center gap-1 text-amber-500">
          <Coffee className="h-3.5 w-3.5" />
          {article.coffeeCount}
        </div>
      ),
    },
    {
      key: "commentCount",
      label: "Comments",
      render: (article) => (
        <div className="flex items-center gap-1 text-white">
          <MessageSquare className="h-3.5 w-3.5" />
          {article.commentCount}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (article) => (
        <span className="text-white">{article.createdAt}</span>
      ),
    },
  ]

  const renderMobileCard = (article: Article) => (
    <Card key={article.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="font-medium line-clamp-2">{article.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {article.authorAvatar ? <AvatarImage src={article.authorAvatar} /> : null}
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {article.authorName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white">{article.authorName}</span>
            </div>
          </div>
          {renderDropdownActions(article)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{article.category}</Badge>
          {getStatusBadge(article.status)}
          <span className="text-xs text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min
          </span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-white">Views</p>
            <p className="font-medium">{article.views}</p>
          </div>
          <div>
            <p className="text-white">Likes</p>
            <p className="font-medium">{article.likes}</p>
          </div>
          <div>
            <p className="text-amber-500">Coffees</p>
            <p className="font-medium">{article.coffeeCount}</p>
          </div>
          <div>
            <p className="text-white">Comments</p>
            <p className="font-medium">{article.commentCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Knowledge Sharing</h1>
        <p className="text-white">Manage articles and knowledge sharing content</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white">Total</p>
                <p className="text-2xl font-bold">{totalAll}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-white">Published</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <EyeOff className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-white">Hidden</p>
                <p className="text-2xl font-bold">{hiddenCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-white">Flagged</p>
                <p className="text-2xl font-bold">{flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={localArticles}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search articles by title..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{ status: params.status, category: params.category, dateFrom: params.dateFrom, dateTo: params.dateTo }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={renderDropdownActions}
      />

      {/* Hide Confirmation Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to hide <strong>{selectedArticle?.title}</strong>? It will no longer be visible to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHideDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("hide")}>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Confirmation Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to flag <strong>{selectedArticle?.title}</strong>? This will mark it as inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("flag")}>
              <Flag className="mr-2 h-4 w-4" />
              Flag Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedArticle?.title}</strong>? This will permanently remove the article, all comments, and likes. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("delete")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
