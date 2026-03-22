import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Clock, Mail, CheckCircle2, ArrowRight } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">LaoDev</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription>
              Your developer application is pending admin review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <h3 className="mb-3 font-semibold">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-muted-foreground">
                      Your email has been successfully verified
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                  <div>
                    <p className="font-medium">Admin Review</p>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your profile within 24-48 hours
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Get Notified</p>
                    <p className="text-sm text-muted-foreground">
                      {"You'll"} receive an email once your profile is approved
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full gap-2">
                  Return to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/developers">
                <Button variant="outline" className="w-full">
                  Browse Other Developers
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Have questions? Contact us at{" "}
              <a href="mailto:support@laodev.la" className="text-primary hover:underline">
                support@laodev.la
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
