import { useState, useEffect } from "react"
import { Link, useParams, useSearchParams, useLoaderData, useActionData, Form, useNavigation, useFetcher, redirect } from "react-router"
import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session.server"
import type { Route } from "./+types/detail"
import { Navigation } from "@/components/navigation"
import { PendingReviewModal } from "@/components/pending-review-modal"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  ThumbsUp,
  CheckCircle2,
  MoreHorizontal,
  Flag,
  Share2,
  Bookmark,
  Send,
  ChevronUp,
  ChevronDown,
  Reply,
  Eye,
  User,
  Calendar,
  MapPin,
  Flag,
} from "lucide-react"

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

export async function loader({ params, request }: Route.LoaderArgs) {
  const postId = params.id!
  const currentUser = await getUser(request)

  const dbPost = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, authorName: true, content: true, likes: true, createdAt: true,
          commentLikes: currentUser ? { where: { userId: currentUser.userId }, select: { id: true } } : false,
          replies: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true, authorName: true, content: true, likes: true, createdAt: true,
              commentLikes: currentUser ? { where: { userId: currentUser.userId }, select: { id: true } } : false,
            },
          },
        },
      },
    },
  })

  if (dbPost) {
    // Block hidden posts
    if (dbPost.status === "hidden") {
      throw new Response("Post not found", { status: 404 })
    }

    // Increment view count
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    })
    return {
      dbPost: {
        id: dbPost.id,
        title: dbPost.title,
        description: dbPost.content,
        content: dbPost.content,
        author: {
          name: dbPost.author.name,
          avatar: dbPost.author.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
          reputation: 0,
          joinedDate: "",
          location: "Laos",
        },
        budget: dbPost.budget || "",
        skills: dbPost.tags,
        responses: dbPost.comments.length,
        views: dbPost.views + 1,
        status: dbPost.status || "published",
        createdAt: timeAgo(dbPost.createdAt),
        type: dbPost.type || "project",
      },
      dbComments: dbPost.comments.map((c) => ({
        id: c.id,
        author: c.authorName,
        content: c.content,
        likes: c.likes,
        liked: Array.isArray(c.commentLikes) && c.commentLikes.length > 0,
        createdAt: timeAgo(c.createdAt),
        replies: c.replies.map((r) => ({
          id: r.id,
          author: r.authorName,
          content: r.content,
          likes: r.likes,
          liked: Array.isArray(r.commentLikes) && r.commentLikes.length > 0,
          createdAt: timeAgo(r.createdAt),
        })),
      })),
      isSaved: currentUser
        ? !!(await prisma.savedPost.findUnique({ where: { postId_userId: { postId, userId: currentUser.userId } } }))
        : false,
      similarPosts: await prisma.post.findMany({
        where: { id: { not: postId }, status: { not: "hidden" } },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { comments: true } } },
      }).then((posts) =>
        posts.map((p) => ({
          id: p.id,
          title: p.title,
          responses: p._count.comments,
          budget: p.budget || "",
        }))
      ),
    }
  }

  return { dbPost: null, dbComments: [], similarPosts: [], isSaved: false }
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUser(request)
  if (!user) throw redirect("/login")

  const formData = await request.formData()
  const intent = String(formData.get("intent") || "comment")
  const postId = params.id!

  // Like/unlike a comment
  if (intent === "like-comment") {
    const commentId = String(formData.get("commentId"))
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: user.userId } },
    })

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } })
      await prisma.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } })
    } else {
      await prisma.commentLike.create({ data: { commentId, userId: user.userId } })
      await prisma.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } })
    }
    return { success: true, intent: "like-comment" }
  }

  // Save/unsave a post
  if (intent === "save-post") {
    const existing = await prisma.savedPost.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
    })

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } })
      return { success: true, intent: "save-post", saved: false }
    } else {
      await prisma.savedPost.create({ data: { postId, userId: user.userId } })
      return { success: true, intent: "save-post", saved: true }
    }
  }

  // Block pending developers from commenting
  if (user.role === "DEVELOPER") {
    const dev = await prisma.developer.findUnique({ where: { userId: user.userId }, select: { status: true } })
    if (dev?.status === "PENDING") {
      return { error: "pending_review", intent: "comment" }
    }
  }

  // Comment / reply
  const content = String(formData.get("content"))
  const parentId = formData.get("parentId") ? String(formData.get("parentId")) : null

  if (!content.trim()) {
    return { error: "Comment cannot be empty" }
  }

  await prisma.comment.create({
    data: {
      postId,
      authorId: user.userId,
      authorName: user.name,
      content: content.trim(),
      parentId,
    },
  })

  return { success: true, intent: "comment" }
}

// Mock post data (fallback for non-DB posts)
const postsData: Record<string, {
  id: string
  title: string
  description: string
  content: string
  author: {
    name: string
    avatar: string
    reputation: number
    joinedDate: string
    location: string
  }
  budget: string
  skills: string[]
  responses: number
  views: number
  status: string
  createdAt: string
  type: string
}> = {
  "1": {
    id: "1",
    title: "Need help building a React Native app for my restaurant business",
    description:
      "Looking for an experienced mobile developer to help me create an ordering app for my restaurant. Need features like menu display, cart, and payment integration.",
    content: `## Project Overview

I'm the owner of a local restaurant in Vientiane and I'm looking to modernize our ordering system. We need a mobile app that allows customers to:

### Required Features

1. **Browse Menu** - Display all our food items with images, descriptions, and prices
2. **Shopping Cart** - Allow customers to add/remove items and modify quantities
3. **Online Payment** - Integration with local payment methods (BCEL OnePay, LDB)
4. **Order Tracking** - Real-time order status updates
5. **User Accounts** - Customer registration and order history

### Technical Requirements

- Cross-platform (iOS and Android)
- React Native preferred
- Must work with our existing POS system
- Admin panel for menu management

### Timeline

Looking to complete this project within 2-3 months. Can start immediately.

### Budget

500-1000 Kip, negotiable for the right developer.

Please include examples of similar apps you've built when responding.`,
    author: {
      name: "Bounmy K.",
      avatar: "BK",
      reputation: 45,
      joinedDate: "Jan 2024",
      location: "Vientiane, Laos",
    },
    budget: "500-1000 Kip",
    skills: ["React Native", "Mobile", "Payment Integration", "Firebase"],
    responses: 5,
    views: 234,
    status: "active",
    createdAt: "2 hours ago",
    type: "project",
  },
  "2": {
    id: "2",
    title: "Junior developer seeking React mentorship",
    description:
      "I am a junior developer with basic HTML/CSS knowledge looking for a mentor to guide me in learning React and modern frontend development.",
    content: `## About Me

I'm a self-taught developer from Savannakhet who has been learning web development for the past 6 months. I've completed several online courses and have basic knowledge of:

- HTML5 & CSS3
- Basic JavaScript
- Git fundamentals

### What I'm Looking For

I need a mentor who can help me:

1. **Learn React** - Understand components, hooks, state management
2. **Build Real Projects** - Guidance on building portfolio projects
3. **Code Reviews** - Review my code and provide feedback
4. **Career Advice** - Help me prepare for my first developer job

### My Availability

- Available evenings and weekends
- Looking for 2-4 hours per week of mentorship
- Can communicate in Lao and English

### Budget

30-50 Kip/hour for mentorship sessions. Open to package deals for longer commitments.

I'm highly motivated and ready to put in the work!`,
    author: {
      name: "Singkham V.",
      avatar: "SV",
      reputation: 12,
      joinedDate: "Mar 2024",
      location: "Savannakhet, Laos",
    },
    budget: "30-50 Kip/hour",
    skills: ["React", "JavaScript", "Frontend", "Mentorship"],
    responses: 8,
    views: 456,
    status: "active",
    createdAt: "5 hours ago",
    type: "mentorship",
  },
}

// Mock answers/responses data
const mockAnswers = [
  {
    id: "a1",
    postId: "1",
    content: `Hi Bounmy,

I'd be happy to help with your restaurant app! I have 5+ years of experience building React Native apps and have completed similar projects for F&B businesses.

### My Relevant Experience

- Built a food delivery app for a restaurant chain in Thailand
- Integrated BCEL OnePay in 3 different apps
- Experience with POS system integrations

### Proposed Approach

1. **Week 1-2**: UI/UX design and wireframes
2. **Week 3-6**: Core app development (menu, cart, user auth)
3. **Week 7-8**: Payment integration and testing
4. **Week 9-10**: Admin panel and POS integration
5. **Week 11-12**: Testing and deployment

### Portfolio

You can check my previous work at [portfolio link]. I'd be happy to schedule a call to discuss your requirements in detail.

Looking forward to hearing from you!`,
    author: {
      name: "Vilay P.",
      avatar: "VP",
      reputation: 342,
      joinedDate: "Jun 2023",
      isVerified: true,
    },
    votes: 12,
    userVote: null as "up" | "down" | null,
    isAccepted: true,
    createdAt: "1 hour ago",
    comments: [
      {
        id: "c1",
        content: "Great portfolio! The food delivery app looks exactly like what I need.",
        author: "Bounmy K.",
        createdAt: "45 min ago",
        votes: 3,
      },
      {
        id: "c2",
        content: "Thanks! Let me know when you're free for a call.",
        author: "Vilay P.",
        createdAt: "30 min ago",
        votes: 1,
      },
    ],
  },
  {
    id: "a2",
    postId: "1",
    content: `Hello!

I'm interested in this project. I'm a mobile developer based in Vientiane with experience in React Native and Flutter.

### What I Can Offer

- Local developer (easy communication and meetings)
- Experience with Lao payment gateways
- Ongoing maintenance and support

### Questions

1. Do you have design mockups ready, or do you need help with design?
2. What's your current POS system?
3. How many menu items do you have approximately?

Let me know and I can provide a more detailed proposal.`,
    author: {
      name: "Kham S.",
      avatar: "KS",
      reputation: 89,
      joinedDate: "Sep 2023",
      isVerified: false,
    },
    votes: 5,
    userVote: null as "up" | "down" | null,
    isAccepted: false,
    createdAt: "1.5 hours ago",
    comments: [
      {
        id: "c3",
        content: "We don't have mockups yet. Our POS is a local system. We have about 50 items.",
        author: "Bounmy K.",
        createdAt: "1 hour ago",
        votes: 0,
      },
    ],
  },
  {
    id: "a3",
    postId: "1",
    content: `I can help with this project. I've built several restaurant apps including online ordering and table reservation systems.

For your budget range, I'd suggest starting with a MVP (Minimum Viable Product) that includes:
- Menu browsing
- Basic cart functionality
- Order placement (with manual payment confirmation initially)

Then we can add payment integration and advanced features in phase 2. This approach reduces initial risk and lets you test the market.

Happy to discuss further!`,
    author: {
      name: "Somphone L.",
      avatar: "SL",
      reputation: 156,
      joinedDate: "Dec 2023",
      isVerified: true,
    },
    votes: 8,
    userVote: null as "up" | "down" | null,
    isAccepted: false,
    createdAt: "2 hours ago",
    comments: [],
  },
]

// Similar posts for sidebar
const similarPosts = [
  {
    id: "3",
    title: "Website redesign for local NGO",
    responses: 3,
    budget: "800-1500 Kip",
  },
  {
    id: "4",
    title: "Need guidance on AWS architecture",
    responses: 2,
    budget: "100-200 Kip",
  },
  {
    id: "5",
    title: "E-commerce website development",
    responses: 7,
    budget: "1000-2000 Kip",
  },
]

export default function PostDetailPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const loaderData = useLoaderData<typeof loader>()
  const postId = params.id as string

  // Use DB data if available, otherwise fall back to mock
  const post = loaderData.dbPost || postsData[postId] || postsData["1"]

  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  useEffect(() => {
    if (searchParams.get("created") === "success") {
      toast.success("Post published successfully!")
    }
  }, [searchParams])

  useEffect(() => {
    if (actionData && "error" in actionData && actionData.error === "pending_review") {
      setShowPendingModal(true)
      return
    }
    if (actionData && "success" in actionData) {
      const intent = "intent" in actionData ? actionData.intent : "comment"
      if (intent === "comment") toast.success("Response submitted successfully!")
      else if (intent === "save-post") {
        const saved = "saved" in actionData ? actionData.saved : false
        toast.success(saved ? "Post saved!" : "Post unsaved")
      }
    }
  }, [actionData])

  // Use DB comments if available, otherwise fall back to mock answers
  const dbComments = loaderData.dbComments || []
  const hasMockData = !loaderData.dbPost
  const [answers, setAnswers] = useState(hasMockData ? mockAnswers.filter(a => a.postId === postId || a.postId === "1") : [])
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [showCommentInput, setShowCommentInput] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes")
  const [isCopied, setIsCopied] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const saveFetcher = useFetcher()

  // Optimistic save state
  const optimisticSaved = saveFetcher.formData
    ? !loaderData.isSaved
    : loaderData.isSaved

  const handleShare = async () => {
    const url = window.location.href.split("?")[0]
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleVote = (answerId: string, voteType: "up" | "down") => {
    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        const currentVote = answer.userVote
        let newVotes = answer.votes

        if (currentVote === voteType) {
          // Remove vote
          newVotes = voteType === "up" ? newVotes - 1 : newVotes + 1
          return { ...answer, votes: newVotes, userVote: null }
        } else if (currentVote === null) {
          // New vote
          newVotes = voteType === "up" ? newVotes + 1 : newVotes - 1
          return { ...answer, votes: newVotes, userVote: voteType }
        } else {
          // Change vote
          newVotes = voteType === "up" ? newVotes + 2 : newVotes - 2
          return { ...answer, votes: newVotes, userVote: voteType }
        }
      }
      return answer
    }))
  }


  const handleAddComment = (answerId: string) => {
    const commentText = newComments[answerId]
    if (!commentText?.trim()) return

    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        return {
          ...answer,
          comments: [
            ...answer.comments,
            {
              id: `c${Date.now()}`,
              content: commentText,
              author: "You",
              createdAt: "Just now",
              votes: 0,
            }
          ]
        }
      }
      return answer
    }))

    setNewComments(prev => ({ ...prev, [answerId]: "" }))
    setShowCommentInput(prev => ({ ...prev, [answerId]: false }))
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted) return -1
    if (b.isAccepted) return 1
    if (sortBy === "votes") return b.votes - a.votes
    return 0 // For newest, we'd compare dates
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16 sm:pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Post Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={
                      post.type === "project"
                        ? "border-blue-500/50 text-blue-400"
                        : post.type === "mentorship"
                          ? "border-purple-500/50 text-purple-400"
                          : "border-yellow-500/50 text-yellow-400"
                    }
                  >
                    {post.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={post.status === "active" ? "border-green-500/50 text-green-400" : "border-muted-foreground/50"}
                  >
                    {post.status}
                  </Badge>
                </div>

                {post.status === "flagged" && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <Flag className="h-4 w-4 shrink-0" />
                    <p>This post has been flagged for potentially violating community guidelines. Content may be inappropriate or contain spam.</p>
                  </div>
                )}

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
                  {post.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Asked {post.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {loaderData.dbPost ? dbComments.length : answers.length} responses
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                      {post.content.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-white">{line.replace('## ', '')}</h2>
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-white">{line.replace('### ', '')}</h3>
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="ml-4 text-white">{line.replace('- ', '')}</li>
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="ml-4 text-white list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-semibold text-white">{line.replace(/\*\*/g, '')}</p>
                        }
                        if (line === '') {
                          return <br key={i} />
                        }
                        return <p key={i} className="text-white">{line}</p>
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Post Footer */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <saveFetcher.Form method="post">
                        <input type="hidden" name="intent" value="save-post" />
                        <Button type="submit" variant="ghost" size="sm" className="gap-1">
                          <Bookmark className={`h-4 w-4 ${optimisticSaved ? "fill-primary text-primary" : ""}`} />
                          {optimisticSaved ? "Saved" : "Save"}
                        </Button>
                      </saveFetcher.Form>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                        {isCopied ? "Copied!" : "Share"}
                      </Button>
                    </div>

                    {/* Author Card */}
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {post.author.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{post.author.name}</p>
                        <div className="flex items-center gap-2 text-xs text-white">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {post.author.location}
                          </span>
                          <span>•</span>
                          <span>{post.author.reputation} rep</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answers Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {loaderData.dbPost ? dbComments.length : answers.length} Response{(loaderData.dbPost ? dbComments.length : answers.length) !== 1 ? "s" : ""}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Sort by:</span>
                    <Button
                      variant={sortBy === "votes" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy("votes")}
                    >
                      Highest score
                    </Button>
                    <Button
                      variant={sortBy === "newest" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy("newest")}
                    >
                      Newest
                    </Button>
                  </div>
                </div>

                {/* DB Comments */}
                {loaderData.dbPost && dbComments.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {dbComments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {comment.author[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{comment.author}</p>
                              <p className="text-xs text-white">{comment.createdAt}</p>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-white/90 leading-relaxed text-sm">
                            {comment.content}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-xs text-white hover:text-primary"
                              onClick={() => setShowCommentInput(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                            >
                              <Reply className="h-3.5 w-3.5" />
                              Reply
                            </Button>
                            <LikeButton commentId={comment.id} likes={comment.likes} liked={comment.liked} />
                          </div>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-6 w-6 border border-border">
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {reply.author[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-primary">{reply.author}</span>
                                    <span className="text-xs text-white">{reply.createdAt}</span>
                                  </div>
                                  <div className="flex items-center gap-2 ml-8 mt-1">
                                    <p className="text-sm text-white/80 flex-1">{reply.content}</p>
                                    <LikeButton commentId={reply.id} likes={reply.likes} liked={reply.liked} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {showCommentInput[comment.id] && (
                            <div className="mt-3 ml-6 border-l-2 border-primary/20 pl-4">
                              <Form method="post" className="flex gap-2" key={`reply-${comment.id}-${comment.replies?.length || 0}`}>
                                <input type="hidden" name="parentId" value={comment.id} />
                                <Textarea
                                  name="content"
                                  placeholder="Write a reply..."
                                  className="min-h-[60px] flex-1 text-sm"
                                  required
                                />
                                <Button type="submit" size="icon" className="shrink-0 self-end" disabled={isSubmitting}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </Form>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Mock Answers List (for non-DB posts) */}
                <div className={`space-y-4 ${loaderData.dbPost ? "hidden" : ""}`}>
                  {sortedAnswers.map((answer) => (
                    <Card
                      key={answer.id}
                      className={`overflow-hidden ${answer.isAccepted ? "border-green-500/50 bg-green-500/5" : ""}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Voting Column */}
                          <div className="flex flex-col items-center gap-1 p-4 bg-secondary/30 border-r border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${answer.userVote === "up" ? "text-primary" : ""}`}
                              onClick={() => handleVote(answer.id, "up")}
                            >
                              <ChevronUp className="h-5 w-5" />
                            </Button>
                            <span className={`text-lg font-semibold ${answer.votes > 0 ? "text-primary" : answer.votes < 0 ? "text-destructive" : ""}`}>
                              {answer.votes}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${answer.userVote === "down" ? "text-destructive" : ""}`}
                              onClick={() => handleVote(answer.id, "down")}
                            >
                              <ChevronDown className="h-5 w-5" />
                            </Button>
                            {answer.isAccepted && (
                              <CheckCircle2 className="h-6 w-6 text-green-500 mt-2" />
                            )}
                          </div>

                          {/* Answer Content */}
                          <div className="flex-1 p-4">
                            {answer.isAccepted && (
                              <div className="mb-3 flex items-center gap-2 text-sm text-green-500">
                                <CheckCircle2 className="h-4 w-4" />
                                Accepted Answer
                              </div>
                            )}

                            <div className="whitespace-pre-wrap text-white/90 leading-relaxed text-sm">
                              {answer.content.split('\n').map((line, i) => {
                                if (line.startsWith('### ')) {
                                  return <h4 key={i} className="text-base font-semibold mt-3 mb-2 text-white">{line.replace('### ', '')}</h4>
                                }
                                if (line.startsWith('- ')) {
                                  return <li key={i} className="ml-4 text-white">{line.replace('- ', '')}</li>
                                }
                                if (line.match(/^\d+\./)) {
                                  return <li key={i} className="ml-4 text-white list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
                                }
                                if (line === '') {
                                  return <br key={i} />
                                }
                                return <span key={i}>{line}<br /></span>
                              })}
                            </div>

                            {/* Answer Footer */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-xs"
                                  onClick={() => setShowCommentInput(prev => ({ ...prev, [answer.id]: !prev[answer.id] }))}
                                >
                                  <Reply className="h-3.5 w-3.5" />
                                  Add comment
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                  <Share2 className="h-3.5 w-3.5" />
                                  Share
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem>
                                      <Flag className="h-4 w-4 mr-2" />
                                      Report
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Responder Info */}
                              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2 px-3">
                                <div className="text-right text-xs">
                                  <p className="text-white">answered {answer.createdAt}</p>
                                </div>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                    {answer.author.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium flex items-center gap-1">
                                    {answer.author.name}
                                    {answer.author.isVerified && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                    )}
                                  </p>
                                  <p className="text-xs text-white">{answer.author.reputation} rep</p>
                                </div>
                              </div>
                            </div>

                            {/* Comments Section */}
                            {answer.comments.length > 0 && (
                              <div className="mt-4 border-t border-border pt-4">
                                <div className="space-y-3">
                                  {answer.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 text-sm bg-secondary/20 rounded-lg p-3">
                                      <div className="flex-1">
                                        <span className="text-white">{comment.content}</span>
                                        <span className="text-white"> – </span>
                                        <span className="font-medium text-primary">{comment.author}</span>
                                        <span className="text-white text-xs ml-2">{comment.createdAt}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-white">
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <ThumbsUp className="h-3 w-3" />
                                        </Button>
                                        <span className="text-xs">{comment.votes}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add Comment Input */}
                            {showCommentInput[answer.id] && (
                              <div className="mt-4 flex gap-2">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={newComments[answer.id] || ""}
                                  onChange={(e) => setNewComments(prev => ({ ...prev, [answer.id]: e.target.value }))}
                                  className="min-h-[60px] text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddComment(answer.id)}
                                  disabled={!newComments[answer.id]?.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Submit Your Answer */}
              <Card className="mt-8">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Your Response</h3>
                  <p className="text-sm text-white">
                    Share your proposal or offer help to this request
                  </p>
                </CardHeader>
                <CardContent>
                  <Form method="post" className="space-y-4" key={dbComments.length}>
                    <Textarea
                      name="content"
                      placeholder="Write your response here... Include your relevant experience, proposed approach, and timeline."
                      className="min-h-[200px]"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white">
                        Markdown formatting is supported
                      </p>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? "Submitting..." : "Submit Response"}
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              {/* Author Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Posted By
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.author.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author.name}</p>
                      <p className="text-sm text-white">{post.author.reputation} reputation</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="h-4 w-4" />
                      {post.author.location}
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-4 w-4" />
                      Member since {post.author.joinedDate}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Posts */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Similar Posts
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(loaderData.similarPosts.length > 0 ? loaderData.similarPosts : similarPosts).map((similarPost) => (
                    <Link
                      key={similarPost.id}
                      to={`/posts/${similarPost.id}`}
                      className="block p-3 rounded-lg bg-secondary/50 hover:bg-primary/20 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                        {similarPost.title}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-white">
                        <span>{similarPost.responses} responses</span>
                        <span>{similarPost.budget}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PendingReviewModal open={showPendingModal} onOpenChange={setShowPendingModal} />
      <Footer />
    </div>
  )
}

// Optimistic like button component — matches save button style
function LikeButton({ commentId, likes, liked }: { commentId: string; likes: number; liked: boolean }) {
  const fetcher = useFetcher()
  const optimisticLiked = fetcher.formData ? !liked : liked
  const optimisticLikes = fetcher.formData ? (liked ? likes - 1 : likes + 1) : likes

  return (
    <fetcher.Form method="post" className="inline">
      <input type="hidden" name="intent" value="like-comment" />
      <input type="hidden" name="commentId" value={commentId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="gap-1"
      >
        <ThumbsUp className={`h-4 w-4 ${optimisticLiked ? "fill-primary text-primary" : ""}`} />
        {optimisticLikes > 0 ? optimisticLikes : "Like"}
      </Button>
    </fetcher.Form>
  )
}
