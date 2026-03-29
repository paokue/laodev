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
  FileText,
  ExternalLink,
} from "lucide-react"

interface Post {
  id: string
  title: string
  authorName: string
  authorAvatar: string | null
  type: string
  budget: string
  status: string
  tags: string[]
  views: number
  likes: number
  commentCount: number
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
  const typeFilter = url.searchParams.get("type") || ""
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

  if (typeFilter && typeFilter !== "all") {
    where.type = typeFilter
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
    if (["title", "views", "likes", "createdAt", "status", "type"].includes(sortKey)) {
      orderBy = { [sortKey]: dir }
    }
  }

  const [posts, totalCount, totalAll, publishedCount, hiddenCount, flaggedCount] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        type: true,
        budget: true,
        status: true,
        tags: true,
        views: true,
        likes: true,
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
    prisma.post.count({ where }),
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "hidden" } }),
    prisma.post.count({ where: { status: "flagged" } }),
  ])

  // Get distinct types for filter
  const types = await prisma.post.findMany({
    distinct: ["type"],
    select: { type: true },
  })

  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      authorName: p.author.name,
      authorAvatar: p.author.avatar,
      type: p.type,
      budget: p.budget || "-",
      status: p.status || "published",
      tags: p.tags,
      views: p.views,
      likes: p.likes,
      commentCount: p._count.comments,
      createdAt: timeAgo(new Date(p.createdAt)),
    })),
    totalCount,
    totalAll,
    publishedCount,
    hiddenCount,
    flaggedCount,
    types: types.map((t) => t.type),
    params: {
      search,
      status: statusFilter,
      type: typeFilter,
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
  const postId = String(formData.get("postId"))

  if (!postId) return { error: "Post ID is required" }

  if (intent === "hide") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "hidden" },
    })
    return { success: "Post hidden" }
  }

  if (intent === "unhide") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "published" },
    })
    return { success: "Post published" }
  }

  if (intent === "flag") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "flagged" },
    })
    return { success: "Post flagged" }
  }

  if (intent === "unflag") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "published" },
    })
    return { success: "Post unflagged" }
  }

  if (intent === "delete") {
    // Delete comments first, then post
    await prisma.comment.deleteMany({ where: { postId } })
    await prisma.post.delete({ where: { id: postId } })
    return { success: "Post deleted" }
  }

  return { error: "Invalid action" }
}

export default function AdminPostsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showHideDialog, setShowHideDialog] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const fetcher = useFetcher<typeof action>()

  const { posts: localPosts, totalCount, totalAll, publishedCount, hiddenCount, flaggedCount, types, params } = loaderData

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success)
      setSelectedPost(null)
      setShowDeleteDialog(false)
      setShowHideDialog(false)
      setShowFlagDialog(false)
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const handleAction = (intent: string) => {
    if (selectedPost) {
      fetcher.submit({ intent, postId: selectedPost.id }, { method: "post" })
    }
  }

  const handleParamsChange = useCallback((p: ServerParams) => {
    const sp = new URLSearchParams()
    if (p.search) sp.set("search", p.search)
    if (p.filters.status && p.filters.status !== "all") sp.set("status", p.filters.status)
    if (p.filters.type && p.filters.type !== "all") sp.set("type", p.filters.type)
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
      key: "type",
      label: "Category",
      options: types.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
    },
    {
      key: "date",
      label: "Created Date",
      type: "dateRange" as const,
      options: [],
    },
  ]

  const renderDropdownActions = (post: Post) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(`/posts/${post.id}`, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View Detail
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {post.status === "hidden" ? (
          <DropdownMenuItem onClick={() => { setSelectedPost(post); handleAction("unhide"); setSelectedPost(post); fetcher.submit({ intent: "unhide", postId: post.id }, { method: "post" }) }}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => { setSelectedPost(post); setShowHideDialog(true) }}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide Post
          </DropdownMenuItem>
        )}
        {post.status === "flagged" ? (
          <DropdownMenuItem onClick={() => { fetcher.submit({ intent: "unflag", postId: post.id }, { method: "post" }) }}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Unflag
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => { setSelectedPost(post); setShowFlagDialog(true) }}>
            <Flag className="mr-2 h-4 w-4" />
            Flag Post
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => { setSelectedPost(post); setShowDeleteDialog(true) }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns: Column<Post>[] = [
    {
      key: "authorName",
      label: "Author",
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {post.authorAvatar ? <AvatarImage src={post.authorAvatar} /> : null}
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {post.authorName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{post.authorName}</span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Post",
      sortable: true,
      render: (post) => (
        <div className="max-w-[250px]">
          <p className="truncate font-medium">{post.title}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Category",
      sortable: true,
      render: (post) => <Badge variant="secondary" className="capitalize">{post.type}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (post) => getStatusBadge(post.status),
    },
    {
      key: "views",
      label: "Views",
      sortable: true,
      render: (post) => (
        <span className="text-white">{post.views}</span>
      ),
    },
    {
      key: "likes",
      label: "Likes",
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-1 text-white">
          <Heart className="h-3.5 w-3.5" />
          {post.likes}
        </div>
      ),
    },
    {
      key: "commentCount",
      label: "Comments",
      render: (post) => (
        <div className="flex items-center gap-1 text-white">
          <MessageSquare className="h-3.5 w-3.5" />
          {post.commentCount}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (post) => (
        <span className="text-white">{post.createdAt}</span>
      ),
    },
  ]

  const renderMobileCard = (post: Post) => (
    <Card key={post.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="font-medium line-clamp-2">{post.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {post.authorAvatar ? <AvatarImage src={post.authorAvatar} /> : null}
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {post.authorName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white">{post.authorName}</span>
            </div>
          </div>
          {renderDropdownActions(post)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">{post.type}</Badge>
          {getStatusBadge(post.status)}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white">Views</p>
            <p className="font-medium">{post.views}</p>
          </div>
          <div>
            <p className="text-white">Likes</p>
            <p className="font-medium">{post.likes}</p>
          </div>
          <div>
            <p className="text-white">Comments</p>
            <p className="font-medium">{post.commentCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold tracking-tight">Posts</h1>
        <p className="text-white">Manage consultation requests and project posts</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
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
        data={localPosts}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search posts by title..."
        filters={filters}
        pageSize={PAGE_SIZE}
        renderMobileCard={renderMobileCard}
        serverSide
        totalItems={totalCount}
        onParamsChange={handleParamsChange}
        initialSearch={params.search}
        initialFilters={{ status: params.status, type: params.type, dateFrom: params.dateFrom, dateTo: params.dateTo }}
        initialPage={params.page}
        initialSort={params.sortKey ? { key: params.sortKey, direction: params.sortDir as "asc" | "desc" } : null}
        actions={renderDropdownActions}
      />

      {/* Hide Confirmation Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to hide <strong>{selectedPost?.title}</strong>? It will no longer be visible to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHideDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("hide")}>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Confirmation Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to flag <strong>{selectedPost?.title}</strong>? This will mark it as inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("flag")}>
              <Flag className="mr-2 h-4 w-4" />
              Flag Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedPost?.title}</strong>? This will permanently remove the post and all its comments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("delete")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
