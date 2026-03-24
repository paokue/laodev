import { Link } from "react-router"
import { Code2, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"

const footerLinks = {
  Platform: [
    { href: "/developers", label: "Browse Developers" },
    { href: "/posts", label: "Project Posts" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
  ],
  Developers: [
    { href: "/register/developer", label: "Join as Developer" },
    { href: "/dashboard", label: "Developer Dashboard" },
    { href: "/resources", label: "Resources" },
    { href: "/community", label: "Community" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
}

const socialLinks = [
  { href: "#", icon: Twitter, label: "Twitter" },
  { href: "#", icon: Github, label: "GitHub" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
  { href: "#", icon: Mail, label: "Email" },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Lao<span className="gradient-text">Dev</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white">
              Connecting developers and clients across Laos. Find expert consultants,
              get mentorship, and build your tech career.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:scale-105"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-white transition-colors group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white">{category}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center text-sm text-white transition-colors hover:text-primary"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-white">
            {new Date().getFullYear()} LaoDev. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-white">
            Made with{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />{" "}
            in Laos
          </p>
        </div>
      </div>
    </footer>
  )
}
