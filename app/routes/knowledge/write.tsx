import { useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link2,
  ImageIcon,
  Quote,
  Heading1,
  Heading2,
  Eye,
  Save,
  Send,
  X,
  Plus,
  Coffee,
  Sparkles,
  FileText,
  CheckCircle2,
  Info,
} from "lucide-react"

const categories = [
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

const currentAuthor = {
  id: "1",
  name: "Somsak Phommavong",
  avatar: "",
  title: "Senior Full-Stack Developer",
  isVerified: true,
}

export default function WriteKnowledgePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishSuccess, setShowPublishSuccess] = useState(false)

  const authorInitials = currentAuthor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector("textarea[name='content']") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let newText = ""

    switch (type) {
      case "bold":
        newText = `**${selectedText || "bold text"}**`
        break
      case "italic":
        newText = `*${selectedText || "italic text"}*`
        break
      case "h1":
        newText = `\n## ${selectedText || "Heading"}\n`
        break
      case "h2":
        newText = `\n### ${selectedText || "Subheading"}\n`
        break
      case "list":
        newText = `\n- ${selectedText || "List item"}\n`
        break
      case "ordered":
        newText = `\n1. ${selectedText || "List item"}\n`
        break
      case "code":
        newText = `\`\`\`\n${selectedText || "code here"}\n\`\`\``
        break
      case "quote":
        newText = `\n> ${selectedText || "Quote"}\n`
        break
      case "link":
        newText = `[${selectedText || "link text"}](url)`
        break
      case "image":
        newText = `![${selectedText || "alt text"}](image-url)`
        break
      default:
        newText = selectedText
    }

    setContent(content.substring(0, start) + newText + content.substring(end))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsPublishing(false)
    setShowPublishSuccess(true)
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/knowledge"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Write Article</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="gap-2 border-border"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? "Edit" : "Preview"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="gap-2 border-border"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!title || !content || !category || isPublishing}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {!isPreview ? (
                <>
                  {/* Title */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Article Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-0 bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto py-2"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a brief excerpt or summary (shown in article previews)..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="min-h-[80px] resize-none border-border bg-card/50 focus:border-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">{excerpt.length}/200 characters</p>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-card/50 border border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("h1")}
                      className="h-8 w-8 p-0"
                      title="Heading"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("h2")}
                      className="h-8 w-8 p-0"
                      title="Subheading"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("bold")}
                      className="h-8 w-8 p-0"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("italic")}
                      className="h-8 w-8 p-0"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("list")}
                      className="h-8 w-8 p-0"
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("ordered")}
                      className="h-8 w-8 p-0"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("code")}
                      className="h-8 w-8 p-0"
                      title="Code Block"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("quote")}
                      className="h-8 w-8 p-0"
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("link")}
                      className="h-8 w-8 p-0"
                      title="Link"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("image")}
                      className="h-8 w-8 p-0"
                      title="Image"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content Editor */}
                  <Textarea
                    name="content"
                    placeholder="Write your article content here... Use Markdown for formatting."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[500px] resize-none border-border bg-card/50 focus:border-primary/50 font-mono text-sm leading-relaxed"
                  />

                  {/* Word Count */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{wordCount} words</span>
                    <span>{readTime} min read</span>
                  </div>
                </>
              ) : (
                /* Preview Mode */
                <Card className="border-border bg-card/50">
                  <CardContent className="p-8">
                    <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
                      {category || "Category"}
                    </Badge>
                    <h1 className="text-3xl font-bold">{title || "Article Title"}</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                      {excerpt || "Article excerpt will appear here..."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-border">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={currentAuthor.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{currentAuthor.name}</span>
                          {currentAuthor.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{readTime} min read</p>
                      </div>
                    </div>

                    <div className="mt-8 prose prose-invert max-w-none">
                      <div className="whitespace-pre-line text-foreground/90 leading-relaxed">
                        {content.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) {
                            return (
                              <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground">
                                {line.replace("## ", "")}
                              </h2>
                            )
                          }
                          if (line.startsWith("### ")) {
                            return (
                              <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">
                                {line.replace("### ", "")}
                              </h3>
                            )
                          }
                          if (line.startsWith("- ")) {
                            return (
                              <li key={i} className="ml-6 text-foreground/80">
                                {line.replace("- ", "")}
                              </li>
                            )
                          }
                          if (line.startsWith("> ")) {
                            return (
                              <blockquote
                                key={i}
                                className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4"
                              >
                                {line.replace("> ", "")}
                              </blockquote>
                            )
                          }
                          if (line.trim() === "") {
                            return <br key={i} />
                          }
                          return (
                            <p key={i} className="my-4 text-foreground/80">
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <Card className="border-border bg-card/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Publishing as</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={currentAuthor.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-sm">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{currentAuthor.name}</span>
                        {currentAuthor.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{currentAuthor.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card className="border-border bg-card/50">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-border bg-card">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags (max 5)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-border bg-card"
                        disabled={tags.length >= 5}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddTag}
                        disabled={tags.length >= 5 || !tagInput.trim()}
                        className="border-border shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 bg-primary/10 text-primary pr-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cover Image URL (optional)</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="border-border bg-card"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coffee Info */}
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-500/20 p-2">
                      <Coffee className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        Earn Coffee Tips
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Share valuable knowledge and readers can show appreciation by buying you a coffee.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-border bg-card/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-primary" />
                    Writing Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Use clear headings to structure your content
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Include code examples when relevant
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Add relevant tags to help readers find your article
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Write a compelling excerpt for previews
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Publish Success Dialog */}
      <Dialog open={showPublishSuccess} onOpenChange={setShowPublishSuccess}>
        <DialogContent className="sm:max-w-md border-border bg-card text-center">
          <div className="flex flex-col items-center py-6">
            <div className="rounded-full bg-primary/20 p-4 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Article Published!</DialogTitle>
              <DialogDescription className="text-center">
                Your article is now live and visible to the community.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate("/knowledge")} className="border-border">
                View All Articles
              </Button>
              <Button onClick={() => navigate("/knowledge/1")}>
                View Article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
