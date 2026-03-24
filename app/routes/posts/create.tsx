import { useState } from "react"
import { Link, Form, useActionData, useNavigation, redirect } from "react-router"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, X, Loader2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session.server"
import type { Route } from "./+types/create"

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request)
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request)

  const formData = await request.formData()
  const type = String(formData.get("type"))
  const title = String(formData.get("title"))
  const content = String(formData.get("description"))
  const skills = formData.getAll("skills").map(String)

  if (!type || !title || !content) {
    return { error: "Post type, title, and description are required" }
  }

  const budget = String(formData.get("budget") || "")

  const post = await prisma.post.create({
    data: {
      authorId: user.userId,
      title,
      content,
      type,
      budget: budget || null,
      tags: skills,
    },
  })

  throw redirect(`/posts/${post.id}?created=success`)
}

const availableSkills = [
  "React", "Node.js", "TypeScript", "Python", "React Native", "Flutter",
  "AWS", "Docker", "PostgreSQL", "MongoDB", "GraphQL", "Next.js",
  "Vue.js", "Go", "Machine Learning", "Data Science", "DevOps", "UI/UX Design",
  "Mobile Development", "Web Development",
]

const postTypes = [
  { value: "project", label: "Project", description: "I need help building or completing a project" },
  { value: "mentorship", label: "Mentorship", description: "I am looking for guidance and learning opportunities" },
  { value: "consultation", label: "Consultation", description: "I need expert advice on a specific topic" },
]

export default function CreatePostPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [selectedType, setSelectedType] = useState("")
  const [skillSearch, setSkillSearch] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skill])
    }
    setSkillSearch("")
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(skill)
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-12 sm:pt-24">
        <div className="mx-auto max-w-2xl px-4 py-4 lg:px-8">
          <Link
            to="/posts"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>

          <Card>
            <CardHeader className="border-b border-primary/50">
              <CardTitle className="text-lg">Create a Post</CardTitle>
              <CardDescription>
                Describe your project or consultation needs. Relevant developers will be
                notified and can respond.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <Form method="post" className="space-y-6">
                {/* Post Type - Radio */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Post Type <span className="text-rose-500">*</span></label>
                  <div className="grid gap-3 sm:grid-cols-3 mt-2">
                    {postTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${selectedType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={selectedType === type.value}
                          onChange={() => setSelectedType(type.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selectedType === type.value ? "border-primary" : "border-muted-foreground/30"
                            }`}>
                            {selectedType === type.value && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="mt-1 text-xs text-white">{type.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Need help building a React Native app"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your project, goals, and what kind of help you need..."
                    rows={6}
                    required
                  />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label htmlFor="budget" className="text-sm font-medium">Budget</label>
                  <Input
                    id="budget"
                    name="budget"
                    placeholder="e.g., 500-1000 Kip or 50 Kip/hour"
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Skills (up to 5)</label>

                  {/* Hidden inputs for selected skills */}
                  {selectedSkills.map((skill) => (
                    <input key={skill} type="hidden" name="skills" value={skill} />
                  ))}

                  <Input
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                  {skillSearch && (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-card">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.slice(0, 6).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                          >
                            {skill}
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-2 text-sm text-white">No skills found</p>
                      )}
                    </div>
                  )}

                  {/* Popular Skills */}
                  <div className="flex flex-wrap gap-2">
                    {availableSkills
                      .slice(0, 8)
                      .filter((s) => !selectedSkills.includes(s))
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>

                  {/* Selected Skills */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} className="gap-1 bg-primary/20 text-primary hover:bg-primary/30">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {actionData?.error && <p className="text-sm text-destructive">{actionData.error}</p>}

                <div className="flex gap-3">
                  <Link to="/posts" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">Cancel</Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || !selectedType}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Publishing...</>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
