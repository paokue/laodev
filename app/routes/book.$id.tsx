import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Calendar,
  Wallet,
  Shield,
  Coffee,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const getDeveloper = (id: string) => ({
  id,
  name: "Somsak Phommavong",
  avatar: "",
  title: "Senior Full-Stack Developer",
  rating: 4.9,
  reviewCount: 47,
  hourlyRate: 45,
})

const availableDates = [
  { date: "Mon, Mar 24", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
  { date: "Tue, Mar 25", slots: ["10:00 AM", "1:00 PM", "3:00 PM"] },
  { date: "Wed, Mar 26", slots: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { date: "Thu, Mar 27", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
  { date: "Fri, Mar 28", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
]

const durations = [
  { value: 30, label: "30 minutes", price: 0.5 },
  { value: 60, label: "1 hour", price: 1 },
  { value: 90, label: "1.5 hours", price: 1.5 },
  { value: 120, label: "2 hours", price: 2 },
]

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const developer = getDeveloper(id!)

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [coffeeTip, setCoffeeTip] = useState<number>(0)
  const walletBalance = 408 // Mock wallet balance

  const initials = developer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const selectedDurationInfo = durations.find((d) => d.value === selectedDuration)
  const totalPrice = developer.hourlyRate * (selectedDurationInfo?.price || 1)

  const handlePayment = async () => {
    setIsLoading(true)
    // Simulate payment
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
          {/* Back Link */}
          <Link
            to={`/developers/${id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          {/* Progress Steps */}
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={cn(
                          "h-1 w-24 sm:w-32 md:w-48",
                          s < step ? "bg-primary" : "bg-secondary"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Select Time</span>
                <span>Details</span>
                <span>Payment</span>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Select Date & Time */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Date & Time</CardTitle>
                    <CardDescription>
                      Choose a convenient time for your consultation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Duration Selection */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        Consultation Duration
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {durations.map((duration) => (
                          <button
                            key={duration.value}
                            type="button"
                            onClick={() => setSelectedDuration(duration.value)}
                            className={cn(
                              "rounded-lg border p-3 text-center transition-colors",
                              selectedDuration === duration.value
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="text-sm font-medium">{duration.label}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {developer.hourlyRate * duration.price} Kip
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        Available Dates
                      </label>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {availableDates.map((day) => (
                          <button
                            key={day.date}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.date)
                              setSelectedTime(null)
                            }}
                            className={cn(
                              "shrink-0 rounded-lg border px-4 py-3 text-center transition-colors",
                              selectedDate === day.date
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="text-sm font-medium">{day.date}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {day.slots.length} slots
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <label className="mb-3 block text-sm font-medium">
                          Available Times for {selectedDate}
                        </label>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                          {availableDates
                            .find((d) => d.date === selectedDate)
                            ?.slots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "rounded-lg border px-4 py-2 text-sm transition-colors",
                                  selectedTime === time
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {time}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(2)}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Details</CardTitle>
                    <CardDescription>
                      Tell the developer what you need help with
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        What would you like to discuss?
                      </label>
                      <Textarea
                        placeholder="Describe your project, questions, or what you need help with..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        This helps the developer prepare for your consultation
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                        Continue to Payment
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Pay with Wallet */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pay with Wallet</CardTitle>
                    <CardDescription>
                      Use your wallet balance to complete the booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Balance */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Wallet Balance</p>
                          <p className="text-lg font-semibold">{walletBalance.toLocaleString()} Kip</p>
                        </div>
                      </div>
                      {walletBalance < totalPrice + coffeeTip && (
                        <Link to="/user/profile?tab=payment">
                          <Button variant="outline" size="sm">Top Up</Button>
                        </Link>
                      )}
                    </div>

                    {/* Coffee Tip */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Coffee className="h-4 w-4 text-amber-400" />
                        Buy a coffee for {developer.name.split(" ")[0]}?
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Show your appreciation with a small tip
                      </p>
                      <div className="flex gap-2">
                        {[0, 5, 10, 20].map((tip) => (
                          <button
                            key={tip}
                            type="button"
                            onClick={() => setCoffeeTip(tip)}
                            className={cn(
                              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                              coffeeTip === tip
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {tip === 0 ? "No thanks" : `${tip} Kip`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-3 rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Consultation fee</span>
                        <span>{totalPrice.toFixed(2)} Kip</span>
                      </div>
                      {coffeeTip > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Coffee className="h-3.5 w-3.5 text-amber-400" />
                            Coffee tip
                          </span>
                          <span>{coffeeTip} Kip</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-border pt-3 font-semibold">
                        <span>Total</span>
                        <span className="text-primary">{(totalPrice + coffeeTip).toFixed(2)} Kip</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining balance</span>
                        <span className={cn(
                          walletBalance - totalPrice - coffeeTip < 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {(walletBalance - totalPrice - coffeeTip).toLocaleString()} Kip
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Your payment is protected by LaoDev</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handlePayment}
                        disabled={isLoading || walletBalance < totalPrice + coffeeTip}
                      >
                        {isLoading
                          ? "Processing..."
                          : walletBalance < totalPrice + coffeeTip
                            ? "Insufficient Balance"
                            : `Pay ${(totalPrice + coffeeTip).toFixed(2)} Kip from Wallet`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                    <p className="mt-2 text-muted-foreground">
                      Your consultation has been booked successfully
                    </p>

                    <div className="mx-auto mt-8 max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 text-left">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={developer.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{developer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {developer.title}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-border pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedTime} ({selectedDurationInfo?.label})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Link to="/dashboard">
                        <Button>Go to Dashboard</Button>
                      </Link>
                      <Link to="/developers">
                        <Button variant="outline">Browse More Developers</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Booking Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Developer Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={developer.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{developer.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span>
                          {developer.rating} ({developer.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Details */}
                  {selectedDate && (
                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      {selectedTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{selectedDurationInfo?.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {developer.hourlyRate} Kip/hour x {selectedDurationInfo?.label}
                      </span>
                      <span>{totalPrice.toFixed(2)} Kip</span>
                    </div>
                    {coffeeTip > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Coffee className="h-3.5 w-3.5 text-amber-400" />
                          Coffee tip
                        </span>
                        <span>{coffeeTip} Kip</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-3 text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{(totalPrice + coffeeTip).toFixed(2)} Kip</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5" />
                      Paying from wallet
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
