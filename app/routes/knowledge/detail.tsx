import { useState } from "react"
import { useParams, Link } from "react-router"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CoffeeModal } from "@/components/coffee-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Coffee,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Clock,
  Calendar,
  ThumbsUp,
  Copy,
  Twitter,
  Linkedin,
  Link2,
  Sparkles,
} from "lucide-react"

// Mock article data
const article = {
  id: "1",
  title: "Building Scalable APIs with Node.js and TypeScript in 2024",
  excerpt: "Learn how to structure your Node.js APIs for scalability using TypeScript, clean architecture, and best practices from production systems.",
  content: `
## Introduction

Building scalable APIs is one of the most important skills for modern backend developers. In this comprehensive guide, I'll share my experience building production-ready APIs that serve millions of requests.

## Why TypeScript?

TypeScript has become the de facto standard for large-scale Node.js applications. Here's why:

- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IDE Support**: Enhanced autocomplete and refactoring capabilities
- **Self-Documenting Code**: Types serve as inline documentation
- **Easier Maintenance**: Types make it easier to understand large codebases

## Project Structure

A well-organized project structure is crucial for scalability. Here's the structure I recommend:

\`\`\`
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── validators/     # Request validation
\`\`\`

## Clean Architecture Principles

Clean architecture separates concerns into layers:

1. **Domain Layer**: Core business logic and entities
2. **Application Layer**: Use cases and application services
3. **Infrastructure Layer**: External services, databases, APIs
4. **Presentation Layer**: Controllers and request handling

## Error Handling

Proper error handling is essential for a good API:

\`\`\`typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Global error handler middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Log unexpected errors
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
\`\`\`

## Database Design Tips

When designing your database schema:

- **Normalize** your data to avoid redundancy
- **Index** frequently queried fields
- **Use transactions** for related operations
- **Implement soft deletes** for data recovery

## Performance Optimization

Here are some techniques I use to optimize API performance:

1. **Caching**: Use Redis for frequently accessed data
2. **Pagination**: Never return unbounded lists
3. **Compression**: Enable gzip compression
4. **Connection Pooling**: Reuse database connections
5. **Query Optimization**: Use EXPLAIN to analyze queries

## Conclusion

Building scalable APIs requires careful planning and attention to best practices. By following clean architecture principles and implementing proper error handling, caching, and database design, you can build APIs that scale to millions of users.

Feel free to reach out if you have any questions!
  `,
  author: {
    id: "1",
    name: "Somsak Phommavong",
    avatar: "",
    title: "Senior Full-Stack Developer",
    bio: "8+ years building scalable applications. Passionate about clean code and mentoring junior developers.",
    location: "Vientiane, Laos",
    isVerified: true,
    coffeePrice: 5,
    totalCoffees: 234,
    followers: 1250,
    bankInfo: {
      bankName: "BCEL",
      accountNumber: "0102000012345678",
      accountName: "SOMSAK PHOMMAVONG",
    },
    walletAddress: "020-1234-5678",
  },
  category: "Backend",
  tags: ["Node.js", "TypeScript", "API Design", "Clean Architecture", "Best Practices"],
  coffeeCount: 47,
  likeCount: 234,
  commentCount: 28,
  viewCount: 1520,
  readTime: 12,
  publishedAt: "January 15, 2024",
  isLiked: false,
  isBookmarked: false,
}

const comments = [
  {
    id: "1",
    author: {
      name: "Keo Bounyavong",
      avatar: "",
      isVerified: true,
    },
    content: "This is exactly what I needed! The clean architecture section is particularly helpful. I've been struggling with organizing my Node.js projects.",
    timestamp: "2 days ago",
    likes: 12,
  },
  {
    id: "2",
    author: {
      name: "Vanida Keomany",
      avatar: "",
      isVerified: true,
    },
    content: "Great article! Would love to see a follow-up on testing strategies for these architectural patterns.",
    timestamp: "1 day ago",
    likes: 8,
  },
  {
    id: "3",
    author: {
      name: "Bounmy Phonethip",
      avatar: "",
      isVerified: false,
    },
    content: "The error handling approach you described is much cleaner than what I was doing. Already refactored my code. Thanks!",
    timestamp: "5 hours ago",
    likes: 5,
  },
]

const relatedArticles = [
  { id: "2", title: "React Server Components: A Deep Dive", author: "Vanida Keomany", coffeeCount: 32 },
  { id: "4", title: "Docker and Kubernetes for Beginners", author: "Thongchanh Sisouphon", coffeeCount: 56 },
  { id: "5", title: "Building Your First Smart Contract", author: "Singkham Vongphachanh", coffeeCount: 28 },
]

export default function KnowledgeDetailPage() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(article.isLiked)
  const [likeCount, setLikeCount] = useState(article.likeCount)
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked)
  const [coffeeCount, setCoffeeCount] = useState(article.coffeeCount)
  const [newComment, setNewComment] = useState("")
  const [coffeeAmount, setCoffeeAmount] = useState(1)
  const [showCoffeeSuccess, setShowCoffeeSuccess] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleCoffee = () => {
    setCoffeeCount(coffeeCount + coffeeAmount)
    setShowCoffeeSuccess(true)
    setTimeout(() => setShowCoffeeSuccess(false), 3000)
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
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount} views</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
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

            {/* Author & Date */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-card/50 border border-border">
              <Link to={`/developers/${article.author.id}`} className="flex items-center gap-4 group">
                <Avatar className="h-14 w-14 border-2 border-border transition-all group-hover:border-primary/50">
                  <AvatarImage src={article.author.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary font-semibold">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold group-hover:text-primary transition-colors">
                      {article.author.name}
                    </span>
                    {article.author.isVerified && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{article.author.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {article.publishedAt}
                  </div>
                </div>
              </Link>

              {/* Coffee Button */}
              <CoffeeModal
                writer={{
                  id: article.author.id,
                  name: article.author.name,
                  avatar: article.author.avatar,
                  title: article.author.title,
                  location: article.author.location,
                  isVerified: article.author.isVerified,
                  totalCoffees: article.author.totalCoffees,
                  bio: article.author.bio,
                  bankInfo: article.author.bankInfo,
                  walletAddress: article.author.walletAddress,
                }}
                coffeePrice={article.author.coffeePrice}
              >
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  <Coffee className="h-4 w-4" />
                  Buy a Coffee
                </Button>
              </CoffeeModal>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="whitespace-pre-line text-foreground/90 leading-relaxed">
              {article.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-foreground">{line.replace('## ', '')}</h2>
                }
                if (line.startsWith('```')) {
                  return null
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-6 text-foreground/80">{line.replace('- ', '')}</li>
                }
                if (line.startsWith('1. ') || line.match(/^\d\. /)) {
                  return <li key={i} className="ml-6 text-foreground/80 list-decimal">{line.replace(/^\d\. /, '')}</li>
                }
                if (line.trim() === '') {
                  return <br key={i} />
                }
                return <p key={i} className="my-4 text-foreground/80">{line}</p>
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card/50 border border-border">
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className={`gap-2 ${isLiked ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-border"}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-border">
                <MessageSquare className="h-4 w-4" />
                {article.commentCount}
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`gap-2 ${isBookmarked ? "bg-primary" : "border-border"}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                Save
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Share:</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Coffee Supporters */}
          <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-card border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-500" />
                {coffeeCount} Coffees Received
              </h3>
              <CoffeeModal
                writer={{
                  id: article.author.id,
                  name: article.author.name,
                  avatar: article.author.avatar,
                  title: article.author.title,
                  location: article.author.location,
                  isVerified: article.author.isVerified,
                  totalCoffees: article.author.totalCoffees,
                  bio: article.author.bio,
                  bankInfo: article.author.bankInfo,
                  walletAddress: article.author.walletAddress,
                }}
                coffeePrice={article.author.coffeePrice}
              >
                <Button size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  <Coffee className="h-4 w-4" />
                  Support
                </Button>
              </CoffeeModal>
            </div>
            <p className="text-sm text-muted-foreground">
              If you found this article helpful, consider buying the author a coffee to support their work.
            </p>
          </div>

          {/* Author Card */}
          <Card className="mt-10 border-border bg-card/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-20 w-20 border-2 border-border mx-auto sm:mx-0">
                  <AvatarImage src={article.author.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-xl font-semibold">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-semibold">{article.author.name}</h3>
                    {article.author.isVerified && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{article.author.title}</p>
                  <p className="mt-2 text-sm text-foreground/80">{article.author.bio}</p>
                  <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                    <div className="text-center">
                      <p className="font-semibold">{article.author.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-amber-500">{article.author.totalCoffees}</p>
                      <p className="text-xs text-muted-foreground">Coffees</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Link to={`/developers/${article.author.id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-border">
                        View Profile
                      </Button>
                    </Link>
                    <Button size="sm" className="w-full sm:w-auto gap-2">
                      <Sparkles className="h-4 w-4" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comments ({comments.length})
            </h2>

            {/* New Comment */}
            <div className="mb-8 p-4 rounded-xl bg-card/50 border border-border">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3 bg-background border-border focus:border-primary/50 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button disabled={!newComment.trim()} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => {
                const commentInitials = comment.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()

                return (
                  <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-card/30 border border-border">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-xs font-semibold">
                        {commentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author.name}</span>
                        {comment.author.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/80">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Related Articles */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link key={related.id} to={`/knowledge/${related.id}`}>
                  <Card className="h-full border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all">
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{related.author}</p>
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
        </article>
      </main>

      <Footer />
    </div>
  )
}
