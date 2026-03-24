import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Clock, CheckCircle2, Coffee } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DeveloperCardProps {
  id: string
  name: string
  avatar?: string
  title: string
  location: string
  skills: string[]
  rating: number
  reviewCount: number
  hourlyRate: number
  yearsExperience: number
  isVerified?: boolean
  isAvailable?: boolean
  variant?: "grid" | "list"
}

export function DeveloperCard({
  id,
  name,
  avatar,
  title,
  location,
  skills,
  rating,
  reviewCount,
  hourlyRate,
  yearsExperience,
  isVerified = true,
  isAvailable = true,
  variant = "grid",
}: DeveloperCardProps) {
  const defaultAvatar = "https://xaosao-local.b-cdn.net/1771560713462-376.jpg"
  const avatarSrc = avatar || defaultAvatar
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  if (variant === "list") {
    return (
      <div className="group relative overflow-hidden rounded-lg border border-primary/50 bg-card transition-all duration-500 hover:bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex gap-0">
          {/* Rectangle Image */}
          <div className="relative shrink-0 w-40 sm:w-48 bg-gradient-to-br from-primary/20 to-secondary">
            <Avatar className="h-full w-full rounded-none border-0">
              <AvatarImage src={avatarSrc} alt={name} className="object-cover" />
              <AvatarFallback className="rounded-none bg-gradient-to-br from-primary/20 to-secondary text-secondary-foreground font-semibold text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <div className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            {isAvailable ? (
              <Badge className="absolute top-3 right-3 gap-1 bg-emerald-500/20 text-emerald-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="absolute top-3 right-3 text-white backdrop-blur-sm">
                Busy
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">{name}</h3>
                  <p className="text-sm text-white">{title}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary/60" />
                  <span>{yearsExperience}+ years</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium text-white">{rating.toFixed(1)}</span>
                  <span>({reviewCount})</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {skills.slice(0, 6).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="font-normal border border-primary/50 text-secondary-foreground bg-primary/20 hover:text-primary"
                  >
                    {skill}
                  </Badge>
                ))}
                {skills.length > 6 && (
                  <Badge variant="outline" className="text-white border-dashed">
                    +{skills.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom row: price + actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-500" />
                <span className="text-primary font-medium">{hourlyRate} Kip</span>
                <span className="text-sm text-white">/coffee</span>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/developers/${id}`}>
                  <Button size="sm" variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary text-sm">
                    View Profile
                  </Button>
                </Link>
                <Link to={`/book/${id}`}>
                  <Button size="sm" className="transition-all duration-300 hover:glow-sm text-sm">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <CardContent className="relative p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-border transition-all duration-300 group-hover:border-primary/50 group-hover:scale-105">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary text-secondary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/50">
                <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">{name}</h3>
            </div>
            <p className="truncate text-sm text-white">{title}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white">
          <div className="flex items-center gap-1 transition-colors group-hover:text-white">
            <MapPin className="h-4 w-4 text-primary/60" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1 transition-colors group-hover:text-white">
            <Clock className="h-4 w-4 text-primary/60" />
            <span>{yearsExperience}+ years</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium text-white">
              {rating.toFixed(1)}
            </span>
            <span className="text-white">({reviewCount})</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill, index) => (
            <Badge
              key={skill}
              variant="secondary"
              className="font-normal border border-primary/50 text-secondary-foreground transition-all duration-300 bg-primary/20 hover:text-primary"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="outline" className="text-white border-dashed">
              +{skills.length - 4} more
            </Badge>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-500" />
            <span className="text-md text-primary">{hourlyRate} Kip</span>
            <span className="text-sm text-white">/coffee</span>
          </div>
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-white">
                Busy
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/developers/${id}`}>
            <Button size="sm" variant="outline" className="w-full group border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary text-sm">
              View Profile
            </Button>
          </Link>
          <Link to={`/book/${id}`}>
            <Button size="sm" className="w-full group/btn transition-all duration-300 hover:glow-sm text-sm">
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
