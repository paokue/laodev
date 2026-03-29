import { useState, useEffect } from "react"
import { Link, Form, useNavigation, useFetcher } from "react-router"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CoffeeModal } from "@/components/coffee-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session.server"
import type { Route } from "./+types/detail"
import {
  Coffee,
  Heart,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Clock,
  Calendar,
  ThumbsUp,
  Sparkles,
  Send,
  Reply,
  Flag,
} from "lucide-react"

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getUser(request)

  // Increment view count
  const article = await prisma.article.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      category: true,
      tags: true,
      status: true,
      views: true,
      likes: true,
      coffeeCount: true,
      readTime: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          developer: {
            select: {
              title: true,
              status: true,
              location: true,
            },
          },
        },
      },
    },
  })

  if (!article || article.status === "hidden") {
    throw new Response("Article not found", { status: 404 })
  }

  // Fetch top-level comments separately — use OR for MongoDB null/unset compatibility
  const topLevelComments = await prisma.articleComment.findMany({
    where: {
      articleId: params.id,
      OR: [{ parentId: null }, { parentId: { isSet: false } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      authorId: true,
      content: true,
      likes: true,
      createdAt: true,
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorName: true,
          authorId: true,
          content: true,
          likes: true,
          createdAt: true,
        },
      },
    },
  })

  // Related articles (same category, exclude current)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "published",
      category: article.category,
      id: { not: article.id },
    },
    orderBy: { views: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      coffeeCount: true,
      author: { select: { name: true } },
    },
  })

  // Count author's total articles, wallet balance, like count, and like status
  const [authorArticleCount, currentUserWallet, userLike, articleLikeCount] = await Promise.all([
    prisma.article.count({
      where: { authorId: article.author.id, status: "published" },
    }),
    session
      ? prisma.wallet.findUnique({
          where: { userId: session.userId },
          select: { balance: true },
        })
      : null,
    session
      ? prisma.articleLike.findUnique({
          where: { articleId_userId: { articleId: params.id!, userId: session.userId } },
          select: { id: true },
        })
      : null,
    prisma.articleLike.count({ where: { articleId: params.id } }),
  ])

  return {
    article: {
      ...article,
      viewCount: article.views,
      commentCount: topLevelComments.length + topLevelComments.reduce((sum: number, c: { replies: unknown[] }) => sum + c.replies.length, 0),
      publishedAt: new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      author: {
        id: article.author.id,
        name: article.author.name,
        avatar: article.author.avatar || "",
        title: article.author.developer?.title || "",
        bio: article.author.bio || "",
        location: article.author.developer?.location || "",
        isVerified: article.author.developer?.status === "APPROVED" || article.author.developer?.status === "ACTIVE",
      },
    },
    comments: topLevelComments.map((c) => ({
      id: c.id,
      authorName: c.authorName,
      authorId: c.authorId,
      content: c.content,
      likes: c.likes,
      timestamp: timeAgo(new Date(c.createdAt)),
      replies: c.replies.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorId: r.authorId,
        content: r.content,
        likes: r.likes,
        timestamp: timeAgo(new Date(r.createdAt)),
      })),
    })),
    relatedArticles: relatedArticles.map((r) => ({
      id: r.id,
      title: r.title,
      author: r.author.name,
      coffeeCount: r.coffeeCount,
    })),
    authorArticleCount,
    currentUserId: session?.userId || null,
    currentUserName: session?.name || null,
    userRole: (session?.role || "USER") as "USER" | "DEVELOPER" | "ADMIN",
    walletBalance: currentUserWallet?.balance || 0,
    isLiked: !!userLike,
    likeCount: articleLikeCount,
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getUser(request)
  if (!session) {
    return { error: "Please login to comment" }
  }

  const formData = await request.formData()
  const intent = String(formData.get("intent"))

  if (intent === "buy-coffee") {
    const amount = parseFloat(String(formData.get("amount")))
    const writerId = String(formData.get("writerId"))
    const coffeeMessage = String(formData.get("message") || "")

    if (!amount || amount <= 0) return { error: "Invalid amount", intent: "buy-coffee" }

    // Get buyer's wallet
    const buyerWallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    })

    if (!buyerWallet || buyerWallet.balance < amount) {
      return { error: "Insufficient balance", intent: "buy-coffee" }
    }

    // Get writer's user ID from the article author
    const writerUser = await prisma.user.findUnique({
      where: { id: writerId },
      select: { id: true },
    })
    if (!writerUser) return { error: "Writer not found", intent: "buy-coffee" }

    // Deduct from buyer's wallet
    await prisma.wallet.update({
      where: { id: buyerWallet.id },
      data: { balance: { decrement: amount } },
    })

    // Create buyer transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: buyerWallet.id,
        type: "COFFEE_TIP",
        amount,
        description: coffeeMessage ? `Coffee tip: "${coffeeMessage}"` : "Coffee tip sent",
      },
    })

    // Upsert writer's wallet and add balance
    const writerWallet = await prisma.wallet.upsert({
      where: { userId: writerId },
      create: { userId: writerId, balance: amount },
      update: { balance: { increment: amount } },
    })

    // Create writer transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: writerWallet.id,
        type: "COFFEE_TIP",
        amount,
        description: coffeeMessage ? `Coffee received: "${coffeeMessage}"` : "Coffee tip received",
      },
    })

    // Increment article coffee count
    await prisma.article.update({
      where: { id: params.id },
      data: { coffeeCount: { increment: 1 } },
    })

    return { success: "Coffee sent!", intent: "buy-coffee" }
  }

  if (intent === "like-article") {
    const existing = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId: params.id!, userId: session.userId } },
    })
    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } })
      await prisma.article.update({ where: { id: params.id }, data: { likes: { decrement: 1 } } })
    } else {
      await prisma.articleLike.create({ data: { articleId: params.id!, userId: session.userId } })
      await prisma.article.update({ where: { id: params.id }, data: { likes: { increment: 1 } } })
    }
    return { success: "ok", intent: "like-article" }
  }

  if (intent === "like-comment") {
    const commentId = String(formData.get("commentId"))
    await prisma.articleComment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
    })
    return { success: "Liked" }
  }

  if (intent === "add-comment") {
    const content = String(formData.get("content")).trim()
    const parentId = formData.get("parentId") ? String(formData.get("parentId")) : null
    if (!content) return { error: "Comment cannot be empty" }

    await prisma.articleComment.create({
      data: {
        articleId: params.id!,
        authorId: session.userId,
        authorName: session.name,
        content,
        ...(parentId ? { parentId } : {}),
      },
    })

    return { success: "Comment posted" }
  }

  return { error: "Invalid action" }
}

function LikeButton({ commentId, likes }: { commentId: string; likes: number }) {
  const fetcher = useFetcher()
  const optimisticLikes = fetcher.state !== "idle" ? likes + 1 : likes

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="like-comment" />
      <input type="hidden" name="commentId" value={commentId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        {optimisticLikes}
      </Button>
    </fetcher.Form>
  )
}

export default function KnowledgeDetailPage({ loaderData, actionData }: Route.ComponentProps) {
  const { article, comments, relatedArticles, authorArticleCount, currentUserId, walletBalance, userRole, isLiked: initialIsLiked, likeCount: initialLikeCount } = loaderData
  const [isBookmarked, setIsBookmarked] = useState(false)
  const likeFetcher = useFetcher()
  const coffeeFetcher = useFetcher<typeof action>()
  const isLikeSubmitting = likeFetcher.state !== "idle"
  const optimisticIsLiked = isLikeSubmitting ? !initialIsLiked : initialIsLiked
  const optimisticLikeCount = isLikeSubmitting
    ? initialIsLiked ? initialLikeCount - 1 : initialLikeCount + 1
    : initialLikeCount
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({})
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Comment posted!")
    }
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  const coffeeSuccess = coffeeFetcher.data && "intent" in coffeeFetcher.data && coffeeFetcher.data.intent === "buy-coffee" && "success" in coffeeFetcher.data

  useEffect(() => {
    if (coffeeSuccess) {
      toast.success("Coffee sent successfully!")
    }
    if (coffeeFetcher.data && "intent" in coffeeFetcher.data && coffeeFetcher.data.intent === "buy-coffee" && "error" in coffeeFetcher.data) {
      toast.error(coffeeFetcher.data.error as string)
    }
  }, [coffeeFetcher.data])

  const handleCoffeePayment = (data: { amount: number; writerId: string; message: string }) => {
    coffeeFetcher.submit(
      { intent: "buy-coffee", amount: String(data.amount), writerId: data.writerId, message: data.message },
      { method: "post" }
    )
  }

  const authorInitials = article.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <article className="mx-auto max-w-4xl px-4 lg:px-8">
          {/* Back Button */}
          <Link
            to="/knowledge"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Sharing
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {article.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-white">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount} views</span>
              </div>
            </div>

            {article.status === "flagged" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <Flag className="h-4 w-4 shrink-0" />
                <p>This article has been flagged for potentially violating community guidelines. Content may be inappropriate or contain spam.</p>
              </div>
            )}

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mt-4 text-lg text-white">
              {article.excerpt}
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-border hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>

          </header>

          {/* Article Content Card */}
          <Card className="overflow-hidden">
            <CardContent className="py-0 px-4 sm:py-6 sm:px-6">
              <div className="prose prose-invert prose-emerald max-w-none">
                <div className="whitespace-pre-line text-white/90 leading-relaxed">
                  {article.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-white">{line.replace('## ', '')}</h2>
                    }
                    if (line.startsWith('```')) {
                      return null
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-6 text-white/80">{line.replace('- ', '')}</li>
                    }
                    if (line.match(/^\d\. /)) {
                      return <li key={i} className="ml-6 text-white/80 list-decimal">{line.replace(/^\d\. /, '')}</li>
                    }
                    if (line.trim() === '') {
                      return <br key={i} />
                    }
                    return <p key={i} className="my-4 text-white/80">{line}</p>
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="gap-1"
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>
                  <likeFetcher.Form method="post">
                    <input type="hidden" name="intent" value="like-article" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <Heart className={`h-4 w-4 ${optimisticIsLiked ? "fill-primary text-primary" : ""}`} />
                      {optimisticLikeCount}
                    </Button>
                  </likeFetcher.Form>
                  <CoffeeModal
                    writer={{
                      id: article.author.id,
                      name: article.author.name,
                      avatar: article.author.avatar,
                      title: article.author.title,
                      location: article.author.location,
                      isVerified: article.author.isVerified,
                      bio: article.author.bio,
                    }}
                    walletBalance={walletBalance}
                    userRole={userRole}
                    onPayment={handleCoffeePayment}
                    isPaymentProcessing={coffeeFetcher.state !== "idle"}
                    paymentSuccess={!!coffeeSuccess}
                  >
                    <Button variant="ghost" size="sm" className="gap-1 text-amber-500 hover:text-amber-500">
                      <Coffee className="h-4 w-4" />
                      Buy Coffee ({article.coffeeCount})
                    </Button>
                  </CoffeeModal>
                </div>

                {/* Author mini card */}
                <Link to={`/developers/${article.author.id}`} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary/70 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={article.author.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">{article.author.name}</p>
                      {article.author.isVerified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white">
                      <span>{article.author.title}</span>
                      <span>·</span>
                      <span>{authorArticleCount} articles</span>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {comments.length} Comment{comments.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 && (
                <p className="text-sm text-white text-center py-8">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {comment.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.authorName}</p>
                        <p className="text-xs text-white">{comment.timestamp}</p>
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
                        className="gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowReplyInput(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                      >
                        <Reply className="h-3.5 w-3.5" />
                        Reply
                      </Button>
                      <LikeButton commentId={comment.id} likes={comment.likes} />
                    </div>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6 border border-border">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {reply.authorName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-primary">{reply.authorName}</span>
                              <span className="text-xs text-white">{reply.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-8 mt-1">
                              <p className="text-sm text-white/80 flex-1">{reply.content}</p>
                              <LikeButton commentId={reply.id} likes={reply.likes} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {showReplyInput[comment.id] && currentUserId && (
                      <div className="mt-3 ml-6 border-l-2 border-primary/20 pl-4">
                        <Form method="post" className="flex gap-2" key={`reply-${comment.id}-${comment.replies?.length || 0}`}>
                          <input type="hidden" name="intent" value="add-comment" />
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

            {/* Post New Comment */}
            {currentUserId ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Leave a Comment</h3>
                  <p className="text-sm text-white">Share your thoughts on this article</p>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <Form method="post" className="space-y-4" key={comments.length}>
                    <input type="hidden" name="intent" value="add-comment" />
                    <Textarea
                      name="content"
                      placeholder="Write your comment here..."
                      className="min-h-[120px]"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting} className="gap-2">
                        <Send className="h-4 w-4" />
                        {isSubmitting ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-white">
                    <Link to="/login" className="text-primary hover:underline">Log in</Link> to leave a comment
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related.id} to={`/knowledge/${related.id}`}>
                    <Card className="h-full border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all">
                      <CardContent className="p-4 border border-rose-500">
                        <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="mt-2 text-sm text-white">{related.author}</p>
                        <div className="mt-3 flex items-center gap-1 text-sm text-amber-500">
                          <Coffee className="h-3.5 w-3.5" />
                          {related.coffeeCount}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  )
}
