import { Link } from "react-router"
import useEmblaCarousel from "embla-carousel-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DeveloperCard } from "@/components/developer-card"
import { TypingAnimation } from "@/components/typing-animation"
import { AnimatedCounter } from "@/components/animated-counter"
import { AnimatedBackground } from "@/components/animated-background"
import {
  Code2,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Terminal,
  Braces,
  Database,
  Server,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const featuredDevelopers = [
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
    rating: 4.9,
    reviewCount: 41,
    hourlyRate: 38,
    yearsExperience: 5,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "5",
    name: "Bounmy Thipphavong",
    avatar: "",
    title: "Backend Engineer",
    location: "Pakse",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "GraphQL"],
    rating: 4.7,
    reviewCount: 23,
    hourlyRate: 42,
    yearsExperience: 7,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "6",
    name: "Chanthala Souvannaphoum",
    avatar: "",
    title: "Data Engineer",
    location: "Vientiane",
    skills: ["Python", "Spark", "Airflow", "SQL", "AWS"],
    rating: 4.8,
    reviewCount: 19,
    hourlyRate: 50,
    yearsExperience: 6,
    isVerified: true,
    isAvailable: false,
  },
  {
    id: "7",
    name: "Phetsavanh Luangrath",
    avatar: "",
    title: "Cloud Architect",
    location: "Luang Prabang",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Serverless"],
    rating: 5.0,
    reviewCount: 35,
    hourlyRate: 60,
    yearsExperience: 12,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "8",
    name: "Noy Xayavong",
    avatar: "",
    title: "Blockchain Developer",
    location: "Vientiane",
    skills: ["Solidity", "Rust", "Web3.js", "Ethereum", "Smart Contracts"],
    rating: 4.6,
    reviewCount: 15,
    hourlyRate: 65,
    yearsExperience: 4,
    isVerified: true,
    isAvailable: true,
  },
  {
    id: "9",
    name: "Somphone Rattanavong",
    avatar: "",
    title: "AI/ML Engineer",
    location: "Savannakhet",
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    rating: 4.9,
    reviewCount: 27,
    hourlyRate: 55,
    yearsExperience: 5,
    isVerified: true,
    isAvailable: true,
  },
]


const stats = [
  { value: 500, suffix: "+", label: "Verified Developers" },
  { value: 2000, suffix: "+", label: "Consultations Completed" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 15, suffix: "+", label: "Tech Skills Covered" },
]

const typingWords = ["Mentors", "Consultants", "Experts", "Engineers", "Architects"]

const floatingIcons = [
  { icon: Terminal, delay: "0s", duration: "6s", x: "10%", y: "20%" },
  { icon: Braces, delay: "1s", duration: "7s", x: "85%", y: "15%" },
  { icon: Database, delay: "2s", duration: "8s", x: "75%", y: "70%" },
  { icon: Server, delay: "0.5s", duration: "6.5s", x: "15%", y: "75%" },
  { icon: Code2, delay: "1.5s", duration: "7.5s", x: "90%", y: "45%" },
]

function FeaturedDevelopersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 3,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const totalSlides = Math.ceil(featuredDevelopers.length / 3)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="relative border-t border-border bg-card/30 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary animate-fade-in-up"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span> Featured Developers</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Meet Our <span className="gradient-text">Top Consultants</span>
          </h2>
          <p className="mt-4 max-w-2xl text-white">
            Experienced developers ready to help with your projects, mentorship needs, or technical challenges.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-12">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed lg:-left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed lg:-right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {featuredDevelopers.map((developer, index) => (
                <div
                  key={developer.id}
                  className="min-w-0 flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                >
                  <div
                    className="animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${(index % 3) * 0.15}s` }}
                  >
                    <DeveloperCard {...developer} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/developers">
            <Button variant="outline" size="lg" className="group gap-2 border-primary/30 hover:border-primary">
              View All Developers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] animate-pulse-glow" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 translate-x-1/2 rounded-full bg-emerald-500/15 blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className="absolute hidden opacity-20 lg:block animate-float"
            style={{
              left: item.x,
              top: item.y,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <item.icon className="h-8 w-8 text-primary" />
          </div>
        ))}

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary animate-fade-in-up"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Laos Developer Community</span>
            </Badge>

            <h1 className="max-w-4xl text-balance text-3xl space-y-4 font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up stagger-1 opacity-0">
              Connect with{" "}
              <span className="relative">
                <span className="gradient-text text-glow">Top</span>
              </span>{" "}
              <br className="block" />
              <TypingAnimation words={typingWords} className="text-primary" />
              <br className="block" />
              in Laos
            </h1>

            <p className="mt-6 w-full text-balance text-lg leading-relaxed text-white sm:text-xl animate-fade-in-up stagger-2 opacity-0">
              Connect with verified developers for expert consultations, mentorship, and project support.
            </p>

            <div className="mt-10 flex gap-4 sm:flex-row animate-fade-in-up stagger-3 opacity-0">
              <Link to="/developers">
                <Button size="lg" className="group gap-2 px-8 glow transition-all hover:glow-lg">
                  Browse Developers
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/register/developer">
                <Button size="lg" variant="outline" className="group gap-2 px-8 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                  <Code2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Join as Developer
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up stagger-4 opacity-0">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 text-center backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-primary sm:text-3xl">
                      <AnimatedCounter
                        end={stat.value}
                        suffix={stat.suffix}
                        duration={2000 + index * 200}
                      />
                    </div>
                    <div className="mt-1 text-xs text-white sm:text-sm">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:block absolute bottom-0 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="flex flex-col items-center gap-2 text-white">
            <span className="text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-muted-foreground/30 p-1">
              <div className="h-2 w-full rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Developers */}
      <FeaturedDevelopersCarousel />

      {/* Post a Project CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px] transition-all duration-700 group-hover:scale-150" />
            <CardContent className="relative p-4 md:p-12">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-6 gap-1.5 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary animate-fade-in-up"
                  >
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>Post Feature</span>
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Need Help With <span className="gradient-text">Your Project</span>?
                  </h2>
                  <p className="mt-4 text-white">
                    Post your project requirements and let developers come to you.
                    Perfect for students, startups, and junior developers seeking guidance.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Describe your project needs",
                      "Get matched with relevant developers",
                      "Choose who you want to work with",
                    ].map((item, index) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm animate-fade-in-up opacity-0"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link to="/posts/create">
                      <Button size="lg" className="group/btn gap-2 glow hover:glow-lg transition-all">
                        Post Your Project
                        <Zap className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-2xl bg-primary/20 blur-2xl animate-pulse-glow" />
                    <div className="relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 animate-pulse" />
                          <div className="space-y-1">
                            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                            <div className="h-3 w-24 rounded bg-muted/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full rounded bg-muted/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
                          <div className="h-3 w-4/5 rounded bg-muted/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                          <div className="h-3 w-3/5 rounded bg-muted/60 animate-pulse" style={{ animationDelay: "0.5s" }} />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.6s" }} />
                          <div className="h-6 w-16 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.7s" }} />
                          <div className="h-6 w-16 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.8s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="relative border-t border-border bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary animate-fade-in-up"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span> Testimonials</span>
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What People <span className="gradient-text">Say</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Found an amazing mentor who helped me land my first dev job. The booking process was seamless!",
                author: "Vongphet K.",
                role: "Junior Developer",
              },
              {
                quote: "As a startup founder, LaoDev helped me find the perfect technical consultant for our MVP.",
                author: "Somchai P.",
                role: "Startup Founder",
              },
              {
                quote: "Great platform to share my knowledge and connect with the local tech community.",
                author: "Khamla S.",
                role: "Senior Developer",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-6">
                  <div className="mb-4 text-4xl text-primary/30">&ldquo;</div>
                  <p className="text-white italic">{testimonial.quote}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20" />
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-white">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-border py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to <span className="gradient-text">Get Started</span>?
          </h2>
          <p className="mt-4 text-white">
            Join the growing community of developers and clients in Laos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 sm:flex-row">
            <Link to="/register/user">
              <Button size="lg" className="group gap-2 px-8 glow hover:glow-lg transition-all">
                <Users className="h-4 w-4 transition-transform group-hover:scale-110" />
                Sign Up Free
              </Button>
            </Link>
            <Link to="/register/developer">
              <Button size="lg" variant="outline" className="group gap-2 px-8 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                <Code2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Join as Developer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
