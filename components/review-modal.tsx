"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle2 } from "lucide-react"

interface ReviewModalProps {
  developerName: string
  developerId: string
  children: React.ReactNode
}

const ratingLabels = [
  "Select a rating",
  "Poor - Very disappointed",
  "Fair - Below expectations",
  "Good - Met expectations",
  "Very Good - Exceeded expectations",
  "Excellent - Outstanding experience",
]

const reviewCategories = [
  { id: "expertise", label: "Technical Expertise" },
  { id: "communication", label: "Communication" },
  { id: "timeliness", label: "Timeliness" },
  { id: "value", label: "Value for Money" },
]

export function ReviewModal({ developerName, developerId, children }: ReviewModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"rating" | "details" | "success">("rating")
  const [overallRating, setOverallRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    expertise: 0,
    communication: 0,
    timeliness: 0,
    value: 0,
  })
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCategoryRating = (category: string, rating: number) => {
    setCategoryRatings((prev) => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setStep("success")
  }

  const handleClose = () => {
    setOpen(false)
    // Reset form after animation
    setTimeout(() => {
      setStep("rating")
      setOverallRating(0)
      setHoveredRating(0)
      setCategoryRatings({
        expertise: 0,
        communication: 0,
        timeliness: 0,
        value: 0,
      })
      setReviewTitle("")
      setReviewContent("")
    }, 300)
  }

  const canProceedToDetails = overallRating > 0
  const canSubmit = reviewContent.length >= 20

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === "rating" && (
          <>
            <DialogHeader>
              <DialogTitle>Rate your experience</DialogTitle>
              <DialogDescription>
                How was your consultation with {developerName}?
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {/* Overall Rating */}
              <div className="text-center">
                <p className="mb-4 text-sm text-white">Overall Rating</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className="group relative p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setOverallRating(rating)}
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${rating <= (hoveredRating || overallRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-white/30"
                          }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-3 h-5 text-sm font-medium text-primary">
                  {ratingLabels[hoveredRating || overallRating]}
                </p>
              </div>

              {/* Category Ratings */}
              {overallRating > 0 && (
                <div className="mt-8 animate-fade-in space-y-4">
                  <p className="text-sm font-medium">Rate specific areas (optional)</p>
                  {reviewCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-sm text-white">
                        {category.label}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            className="p-0.5 transition-transform hover:scale-110"
                            onClick={() => handleCategoryRating(category.id, rating)}
                          >
                            <Star
                              className={`h-5 w-5 transition-colors ${rating <= categoryRatings[category.id]
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-white/30"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={!canProceedToDetails}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>Write your review</DialogTitle>
              <DialogDescription>
                Share your experience to help others make informed decisions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Rating Summary */}
              <div className="flex items-center justify-center gap-1 rounded-lg bg-secondary/50 p-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-5 w-5 ${rating <= overallRating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-white/30"
                      }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">
                  {ratingLabels[overallRating]}
                </span>
              </div>

              {/* Review Title */}
              <div className="space-y-2">
                <Label htmlFor="review-title">Review Title (optional)</Label>
                <input
                  id="review-title"
                  type="text"
                  placeholder="Summarize your experience"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  maxLength={100}
                />
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <Label htmlFor="review-content">Your Review</Label>
                <Textarea
                  id="review-content"
                  placeholder="Share details about your consultation experience. What went well? What could be improved? Would you recommend this developer to others?"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-[150px] resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between text-xs text-white">
                  <span>
                    {reviewContent.length < 20
                      ? `Minimum 20 characters required (${20 - reviewContent.length} more)`
                      : "Your review will help others"}
                  </span>
                  <span>{reviewContent.length}/2000</span>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-sm font-medium">Tips for a helpful review:</p>
                <ul className="mt-2 space-y-1 text-xs text-white">
                  <li>Be specific about what the developer helped you with</li>
                  <li>Mention the quality of communication and responsiveness</li>
                  <li>Share whether the consultation met your expectations</li>
                  <li>Keep it professional and constructive</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep("rating")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="mb-2">Thank you for your review!</DialogTitle>
            <DialogDescription className="mb-6">
              Your feedback helps other users make informed decisions and helps{" "}
              {developerName} improve their services.
            </DialogDescription>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`h-6 w-6 ${rating <= overallRating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-white/30"
                    }`}
                />
              ))}
            </div>
            <Button className="mt-6" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
