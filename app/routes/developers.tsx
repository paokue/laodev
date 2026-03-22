import { useState, useEffect, useRef, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DeveloperCard } from "@/components/developer-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search, SlidersHorizontal, X, Users, Sparkles, LayoutGrid, List, Loader2 } from "lucide-react"

const developers = [
  {
    id: "1",
    name: "Somsak Phommavong",
    avatar: "",
    title: "Senior Full-Stack Developer",
    location: "Vientiane",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 45,
    yearsExperience: 8,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Keo Bounyavong",
    avatar: "",
    title: "Mobile App Developer",
    location: "Luang Prabang",
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    rating: 4.8,
    reviewCount: 32,
    hourlyRate: 40,
    yearsExperience: 6,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "3",
    name: "Thongchanh Sisouphon",
    avatar: "",
    title: "DevOps Engineer",
    location: "Savannakhet",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    rating: 5.0,
    reviewCount: 28,
    hourlyRate: 55,
    yearsExperience: 10,
    isVerified: true,
    isAvailable: false,
  },
  {
    id: "4",
    name: "Vanida Keomany",
    avatar: "",
    title: "UI/UX Designer & Frontend Dev",
    location: "Vientiane",
    skills: ["Figma", "React", "Tailwind CSS", "Next.js", "Framer Motion"],
    rating: 4.7,
    reviewCount: 23,
    hourlyRate: 35,
    yearsExperience: 5,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "5",
    name: "Bounmy Phonethip",
    avatar: "",
    title: "Backend Developer",
    location: "Pakse",
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Redis"],
    rating: 4.9,
    reviewCount: 41,
    hourlyRate: 42,
    yearsExperience: 7,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "6",
    name: "Singkham Vongphachanh",
    avatar: "",
    title: "Blockchain Developer",
    location: "Vientiane",
    skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "DeFi"],
    rating: 4.6,
    reviewCount: 15,
    hourlyRate: 60,
    yearsExperience: 4,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "7",
    name: "Phetsavanh Souphom",
    avatar: "",
    title: "Data Scientist",
    location: "Vientiane",
    skills: ["Python", "TensorFlow", "Machine Learning", "SQL", "Pandas"],
    rating: 4.8,
    reviewCount: 19,
    hourlyRate: 50,
    yearsExperience: 5,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "8",
    name: "Chanthavong Saiyasith",
    avatar: "",
    title: "Cloud Architect",
    location: "Luang Prabang",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes"],
    rating: 4.9,
    reviewCount: 36,
    hourlyRate: 65,
    yearsExperience: 9,
    isVerified: true,
    isAvailable: false,
  },
  {
    id: "9",
    name: "Malivan Douangmala",
    avatar: "",
    title: "Frontend Developer",
    location: "Vientiane",
    skills: ["Vue.js", "Nuxt", "TypeScript", "Tailwind CSS", "GraphQL"],
    rating: 4.7,
    reviewCount: 28,
    hourlyRate: 38,
    yearsExperience: 4,
    isVerified: true,
    isAvailable: true,
  },
]

const skills = [
  "All Skills",
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "Flutter",
  "React Native",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "Figma",
  "Solidity",
  "Vue.js",
  "Machine Learning",
]

const locations = [
  "All Locations",
  "Vientiane",
  "Luang Prabang",
  "Savannakhet",
  "Pakse",
  "Champasak",
  "Xieng Khouang",
]

export default function DevelopersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("All Skills")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const ITEMS_PER_PAGE = 8
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const filteredDevelopers = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesSkill =
      selectedSkill === "All Skills" ||
      dev.skills.some((skill) =>
        skill.toLowerCase().includes(selectedSkill.toLowerCase())
      )

    const matchesLocation =
      selectedLocation === "All Locations" ||
      dev.location.toLowerCase() === selectedLocation.toLowerCase()

    return matchesSearch && matchesSkill && matchesLocation
  })

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSkill("All Skills")
    setSelectedLocation("All Locations")
  }

  const hasActiveFilters =
    searchQuery || selectedSkill !== "All Skills" || selectedLocation !== "All Locations"

  const visibleDevelopers = filteredDevelopers.slice(0, visibleCount)
  const hasMore = visibleCount < filteredDevelopers.length

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [searchQuery, selectedSkill, selectedLocation])

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    setIsLoading(true)
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
      setIsLoading(false)
    }, 500)
  }, [hasMore, isLoading])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="relative pt-12 sm:pt-24">
        {/* Background effects - spans over nav + header */}
        <div className="absolute inset-x-0 top-0 h-[400px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
          <div className="absolute left-1/4 top-0 h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute right-1/4 bottom-0 h-48 w-48 bg-emerald-500/10 blur-[80px] rounded-full" />
        </div>

        <div className="relative bg-card/30 overflow-hidden">

          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <Badge variant="outline" className="mb-4 border-primary/30 animate-fade-in">
              <Users className="mr-1.5 h-3 w-3" />
              {developers.length}+ Verified Developers
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl animate-fade-in-up opacity-0 stagger-1">
              Browse <span className="gradient-text">Developers</span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-lg animate-fade-in-up opacity-0 stagger-2">
              Find the perfect developer for your project from our verified community of experts across Laos
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-12 z-40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex  gap-4 flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search by name, skills, or title..."
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
                  {hasActiveFilters && (
                    <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {(searchQuery ? 1 : 0) + (selectedSkill !== "All Skills" ? 1 : 0) + (selectedLocation !== "All Locations" ? 1 : 0)}
                    </span>
                  )}
                </Button>

                {/* Desktop Filters */}
                <div className="hidden gap-2 lg:flex">
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-[160px] border-border bg-card">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {skills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[160px] border-border bg-card">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Expanded */}
            <div className={`overflow-hidden transition-all duration-300 lg:hidden ${showFilters ? 'max-h-40 mt-4' : 'max-h-0'}`}>
              <div className="flex gap-2">
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {skills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full border-border bg-card">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card/95 backdrop-blur-xl">
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedSkill !== "All Skills" && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Skill: {selectedSkill}
                    <button onClick={() => setSelectedSkill("All Skills")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedLocation !== "All Locations" && (
                  <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Location: {selectedLocation}
                    <button onClick={() => setSelectedLocation("All Locations")} className="hover:text-primary-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 py-0 sm:py-8 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="hidden sm:block text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredDevelopers.length}</span> developer
              {filteredDevelopers.length !== 1 ? "s" : ""}
            </p>
            <div className="hidden items-center gap-1 rounded-lg border border-border p-1 md:flex">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filteredDevelopers.length > 0 ? (
            <>
              <div className={cn(
                "grid",
                viewMode === "grid"
                  ? "gap-3 md:grid-cols-2 lg:grid-cols-4"
                  : "gap-3 md:gap-4 md:grid-cols-1 grid-cols-2 lg:grid-cols-1"
              )}>
                {visibleDevelopers.map((developer, index) => (
                  <div
                    key={developer.id}
                    className="animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 0.05}s` }}
                  >
                    {/* On mobile always show grid card, list only on md+ */}
                    <div className="md:hidden">
                      <DeveloperCard {...developer} variant="grid" />
                    </div>
                    <div className="hidden md:block">
                      <DeveloperCard {...developer} variant={viewMode} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={loaderRef} className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-glow" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-semibold">No developers found</h3>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Try adjusting your search or filters to find what you&apos;re looking for
              </p>
              <Button
                variant="outline"
                className="mt-6 gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                onClick={clearFilters}
              >
                <Sparkles className="h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
