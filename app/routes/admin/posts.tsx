import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { DataTable, Column, FilterOption } from "@/components/admin/data-table"
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Flag,
  CheckCircle2,
  XCircle,
  DollarSign,
  Clock,
  Users,
} from "lucide-react"

interface Post {
  id: string
  title: string
  author: string
  authorEmail: string
  category: string
  budget: string
  status: "open" | "in_progress" | "completed" | "flagged"
  responses: number
  createdAt: string
  deadline: string
}

const posts: Post[] = [
  {
    id: "1",
    title: "Need help building a React Native mobile app",
    author: "Bounmy Khamphouthong",
    authorEmail: "bounmy@email.com",
    category: "Mobile Development",
    budget: "500-1000 Kip",
    status: "open",
    responses: 5,
    createdAt: "2024-03-20",
    deadline: "2024-04-15",
  },
  {
    id: "2",
    title: "Looking for a mentor for Python and Machine Learning",
    author: "Viengkham Thammavong",
    authorEmail: "viengkham@email.com",
    category: "Mentorship",
    budget: "50 Kip/hour",
    status: "in_progress",
    responses: 3,
    createdAt: "2024-03-18",
    deadline: "2024-05-01",
  },
  {
    id: "3",
    title: "Website redesign for my business",
    author: "Manivanh Souphanthong",
    authorEmail: "manivanh@email.com",
    category: "Web Development",
    budget: "300-500 Kip",
    status: "completed",
    responses: 8,
    createdAt: "2024-03-10",
    deadline: "2024-03-25",
  },
  {
    id: "4",
    title: "Database optimization for e-commerce site",
    author: "Khamla Phommachan",
    authorEmail: "khamla@email.com",
    category: "Database",
    budget: "200-400 Kip",
    status: "open",
    responses: 2,
    createdAt: "2024-03-22",
    deadline: "2024-04-10",
  },
  {
    id: "5",
    title: "Inappropriate content post",
    author: "Spam User",
    authorEmail: "spam@email.com",
    category: "Other",
    budget: "N/A",
    status: "flagged",
    responses: 0,
    createdAt: "2024-03-23",
    deadline: "N/A",
  },
  {
    id: "6",
    title: "SEO optimization and digital marketing help",
    author: "Thongphet Vongsavath",
    authorEmail: "thongphet@email.com",
    category: "Marketing",
    budget: "150-300 Kip",
    status: "open",
    responses: 4,
    createdAt: "2024-03-21",
    deadline: "2024-04-20",
  },
]

export default function AdminPostsPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [localPosts, setLocalPosts] = useState(posts)

  const handleFlag = (id: string) => {
    setLocalPosts(
      localPosts.map((post) =>
        post.id === id ? { ...post, status: "flagged" as const } : post
      )
    )
  }

  const handleUnflag = (id: string) => {
    setLocalPosts(
      localPosts.map((post) =>
        post.id === id ? { ...post, status: "open" as const } : post
      )
    )
  }

  const handleDelete = () => {
    if (selectedPost) {
      setLocalPosts(localPosts.filter((post) => post.id !== selectedPost.id))
      setShowDeleteDialog(false)
      setSelectedPost(null)
    }
  }

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "flagged", label: "Flagged" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "Web Development", label: "Web Development" },
        { value: "Mobile Development", label: "Mobile Development" },
        { value: "Database", label: "Database" },
        { value: "Mentorship", label: "Mentorship" },
        { value: "Marketing", label: "Marketing" },
        { value: "Other", label: "Other" },
      ],
    },
  ]

  const getStatusBadge = (status: Post["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            Open
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-white">
            Completed
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            Flagged
          </Badge>
        )
    }
  }

  const columns: Column<Post>[] = [
    {
      key: "title",
      label: "Post",
      sortable: true,
      render: (post) => (
        <div className="max-w-[300px]">
          <p className="truncate font-medium">{post.title}</p>
          <p className="text-sm text-white">{post.author}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (post) => <Badge variant="secondary">{post.category}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (post) => getStatusBadge(post.status),
    },
    {
      key: "budget",
      label: "Budget",
      render: (post) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-white" />
          {post.budget}
        </div>
      ),
    },
    {
      key: "responses",
      label: "Responses",
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-white" />
          {post.responses}
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
                <AvatarFallback className="text-xs">
                  {post.author.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white">{post.author}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {post.status === "flagged" ? (
                <DropdownMenuItem onClick={() => handleUnflag(post.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Unflag Post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleFlag(post.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedPost(post)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{post.category}</Badge>
          {getStatusBadge(post.status)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white">Budget</p>
            <p className="font-medium">{post.budget}</p>
          </div>
          <div>
            <p className="text-white">Responses</p>
            <p className="font-medium">{post.responses}</p>
          </div>
          <div>
            <p className="text-white">Created</p>
            <p className="font-medium">{post.createdAt}</p>
          </div>
          <div>
            <p className="text-white">Deadline</p>
            <p className="font-medium">{post.deadline}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <p className="text-white">Manage consultation requests and project posts</p>
      </div>

      <DataTable
        data={localPosts}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search posts by title..."
        filters={filters}
        pageSize={10}
        renderMobileCard={renderMobileCard}
        actions={(post) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {post.status === "flagged" ? (
                <DropdownMenuItem onClick={() => handleUnflag(post.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Unflag Post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleFlag(post.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedPost(post)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost && !showDeleteDialog} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
                <DialogDescription>View post information and manage status</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPost.title}</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedPost.author.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedPost.author}</p>
                      <p className="text-xs text-white">{selectedPost.authorEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  {getStatusBadge(selectedPost.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-white" />
                    <span>{selectedPost.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white" />
                    <span>{selectedPost.responses} responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white" />
                    <span>Created {selectedPost.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white" />
                    <span>Deadline {selectedPost.deadline}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                  Close
                </Button>
                {selectedPost.status === "flagged" ? (
                  <Button
                    onClick={() => {
                      handleUnflag(selectedPost.id)
                      setSelectedPost(null)
                    }}
                  >
                    Unflag Post
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleFlag(selectedPost.id)
                      setSelectedPost(null)
                    }}
                  >
                    Flag Post
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
