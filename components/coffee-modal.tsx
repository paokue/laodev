"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Coffee,
  CheckCircle2,
  MapPin,
  Heart,
  Wallet,
  AlertCircle,
  Sparkles,
} from "lucide-react"

interface CoffeeModalProps {
  children: React.ReactNode
  writer: {
    id: string
    name: string
    avatar?: string
    title: string
    location?: string
    isVerified?: boolean
    totalCoffees?: number
    bio?: string
  }
  coffeePrice?: number
  walletBalance?: number
  userRole?: "USER" | "DEVELOPER" | "ADMIN"
  onPayment?: (data: { amount: number; writerId: string; message: string }) => void
  isPaymentProcessing?: boolean
  paymentSuccess?: boolean
}

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "")
  if (!num) return ""
  return parseInt(num).toLocaleString()
}

function parseFormattedNumber(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, "")) || 0
}

export function CoffeeModal({ children, writer, coffeePrice = 20000, walletBalance = 0, userRole = "USER", onPayment, isPaymentProcessing = false, paymentSuccess = false }: CoffeeModalProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"amount" | "confirm" | "success">("amount")
  const [displayAmount, setDisplayAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const writerInitials = writer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const totalAmount = selectedAmount
    ? selectedAmount * coffeePrice
    : parseFormattedNumber(displayAmount)

  const coffeeCount = selectedAmount || (totalAmount > 0 ? Math.floor(totalAmount / coffeePrice) : 0)
  const hasEnoughBalance = walletBalance >= totalAmount

  const handleContinue = () => {
    if (totalAmount > 0) {
      setStep("confirm")
    }
  }

  // Move to success step when payment completes
  useEffect(() => {
    if (paymentSuccess && step === "confirm") {
      setStep("success")
    }
  }, [paymentSuccess, step])

  const handlePayment = () => {
    if (!hasEnoughBalance) {
      setIsOpen(false)
      navigate(userRole === "DEVELOPER" || userRole === "ADMIN" ? "/developer/profile?tab=wallet" : "/user/profile?tab=wallet")
      return
    }
    if (onPayment) {
      onPayment({ amount: totalAmount, writerId: writer.id, message })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep("amount")
      setSelectedAmount(null)
      setDisplayAmount("")
      setMessage("")
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg border-border bg-card overflow-hidden">
        {step === "amount" && (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="flex items-center justify-center gap-2 text-xl">
                <Coffee className="h-6 w-6 text-amber-500" />
                Buy a Coffee
              </DialogTitle>
              <DialogDescription className="text-center">
                Support this creator by buying them a coffee
              </DialogDescription>
            </DialogHeader>

            {/* Writer Profile */}
            <div className="flex flex-col items-center py-4 border-y border-border">
              <Avatar className="h-20 w-20 border-2 border-amber-500/30">
                <AvatarImage src={writer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-secondary text-xl font-semibold">
                  {writerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-semibold text-lg">{writer.name}</h3>
                  {writer.isVerified && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-white">{writer.title}</p>
                {writer.location && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-white">
                    <MapPin className="h-3 w-3" />
                    {writer.location}
                  </div>
                )}
                {writer.totalCoffees !== undefined && writer.totalCoffees > 0 && (
                  <Badge variant="secondary" className="mt-2 gap-1 bg-amber-500/10 text-amber-500">
                    <Coffee className="h-3 w-3" />
                    {writer.totalCoffees} coffees received
                  </Badge>
                )}
              </div>
              {writer.bio && (
                <p className="mt-3 text-sm text-white text-center max-w-sm">
                  {writer.bio}
                </p>
              )}
            </div>

            {/* Amount Selection */}
            <div className="space-y-4 py-4">
              <Label className="text-sm font-medium">Select coffee amount</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setDisplayAmount(formatNumber(String(amount * coffeePrice)))
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all ${selectedAmount === amount
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                      : "border-border hover:border-amber-500/50 hover:bg-card"
                      }`}
                  >
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array(Math.min(amount, 3))
                        .fill(0)
                        .map((_, i) => (
                          <Coffee
                            key={i}
                            className={`h-4 w-4 ${selectedAmount === amount ? "text-amber-500" : "text-white"
                              }`}
                          />
                        ))}
                      {amount > 3 && (
                        <span className="text-xs text-amber-500 ml-0.5">x{amount}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{(amount * coffeePrice).toLocaleString()} Kip</span>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label className="text-sm text-white">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-xs">
                    Kip
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAmount}
                    onChange={(e) => {
                      const formatted = formatNumber(e.target.value)
                      setDisplayAmount(formatted)
                      setSelectedAmount(null)
                    }}
                    className="pl-10 border-border bg-card"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm text-white">
                  Leave a message (optional)
                </Label>
                <Textarea
                  placeholder="Say something nice..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none border-border bg-card h-20"
                />
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={totalAmount <= 0}
              className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Coffee className="h-4 w-4" />
              Continue with {totalAmount.toLocaleString()} Kip
            </Button>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="flex items-center justify-center gap-2 text-xl">
                <Wallet className="h-6 w-6 text-primary" />
                Confirm Payment
              </DialogTitle>
              <DialogDescription className="text-center">
                Pay from your wallet balance
              </DialogDescription>
            </DialogHeader>

            {/* Writer Mini Profile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-amber-500/30">
                  <AvatarImage src={writer.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-secondary text-sm">
                    {writerInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{writer.name}</p>
                  <p className="text-xs text-white">{coffeeCount} coffee{coffeeCount > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-amber-500">{totalAmount.toLocaleString()} Kip</p>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="space-y-3 py-4">
              <div className={`p-4 rounded-xl border ${hasEnoughBalance ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Your Wallet Balance
                  </span>
                  <span className={`font-bold ${hasEnoughBalance ? "text-emerald-400" : "text-red-400"}`}>
                    {walletBalance.toLocaleString()} Kip
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Amount to pay</span>
                  <span className="font-medium text-amber-500">-{totalAmount.toLocaleString()} Kip</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-white">Remaining after payment</span>
                  <span className={`font-bold ${hasEnoughBalance ? "text-emerald-400" : "text-red-400"}`}>
                    {(walletBalance - totalAmount).toLocaleString()} Kip
                  </span>
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Insufficient balance</p>
                    <p className="text-xs text-white mt-1">
                      You need {(totalAmount - walletBalance).toLocaleString()} Kip more. Please top up your wallet first.
                    </p>
                  </div>
                </div>
              )}

              {message && (
                <div className="p-3 rounded-xl bg-card/50 border border-border">
                  <p className="text-xs text-white mb-1">Your message:</p>
                  <p className="text-sm italic">"{message}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("amount")}
                className="flex-1 border-border"
              >
                Back
              </Button>
              {hasEnoughBalance ? (
                <Button
                  onClick={handlePayment}
                  disabled={isPaymentProcessing}
                  className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isPaymentProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Coffee className="h-4 w-4" />
                      Pay {totalAmount.toLocaleString()} Kip
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  className="flex-1 gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Top Up Wallet
                </Button>
              )}
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              <div className="rounded-full bg-amber-500/20 p-6 animate-scale-in">
                <Coffee className="h-12 w-12 text-amber-500" />
              </div>
              <div className="absolute -top-1 -right-1 rounded-full bg-primary p-1.5 animate-bounce-subtle">
                <Heart className="h-4 w-4 text-primary-foreground fill-current" />
              </div>
            </div>

            <h3 className="mt-6 text-xl font-semibold flex items-center gap-2">
              Thank You!
              <Sparkles className="h-5 w-5 text-amber-500" />
            </h3>

            <p className="mt-2 text-center text-white">
              You just bought {coffeeCount} coffee{coffeeCount > 1 ? "s" : ""} for {writer.name.split(" ")[0]}!
            </p>

            {message && (
              <div className="mt-4 p-3 rounded-xl bg-card/50 border border-border max-w-sm">
                <p className="text-sm text-center italic">"{message}"</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <Avatar className="h-12 w-12 border-2 border-amber-500">
                <AvatarImage src={writer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-secondary">
                  {writerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{writer.name}</p>
                <p className="text-white">will be notified</p>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="mt-8 w-full max-w-xs"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
