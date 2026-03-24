"use client"

import { useState } from "react"
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
  QrCode,
  Wallet,
  CreditCard,
  Smartphone,
  Copy,
  ExternalLink,
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
    qrCodeUrl?: string
    walletAddress?: string
    bankInfo?: {
      bankName: string
      accountNumber: string
      accountName: string
    }
  }
  coffeePrice?: number
}

export function CoffeeModal({ children, writer, coffeePrice = 5 }: CoffeeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "wallet" | "card">("qr")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  const writerInitials = writer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const totalAmount = selectedAmount
    ? selectedAmount * coffeePrice
    : customAmount
      ? parseFloat(customAmount)
      : 0

  const coffeeCount = selectedAmount || (customAmount ? Math.floor(parseFloat(customAmount) / coffeePrice) : 0)

  const handleContinue = () => {
    if (totalAmount > 0) {
      setStep("payment")
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep("success")
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep("amount")
      setSelectedAmount(null)
      setCustomAmount("")
      setMessage("")
    }, 300)
  }

  // Generate QR Code SVG (placeholder - in production use actual QR library)
  const generateQRCode = () => {
    const data = `laodev://coffee/${writer.id}?amount=${totalAmount}`
    return (
      <div className="relative">
        <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 relative overflow-hidden">
          {/* Simplified QR pattern */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* QR Code pattern simulation */}
            <rect fill="#000" width="100" height="100" />
            <rect fill="#fff" x="5" y="5" width="90" height="90" />

            {/* Corner squares */}
            <rect fill="#000" x="10" y="10" width="25" height="25" />
            <rect fill="#fff" x="13" y="13" width="19" height="19" />
            <rect fill="#000" x="16" y="16" width="13" height="13" />

            <rect fill="#000" x="65" y="10" width="25" height="25" />
            <rect fill="#fff" x="68" y="13" width="19" height="19" />
            <rect fill="#000" x="71" y="16" width="13" height="13" />

            <rect fill="#000" x="10" y="65" width="25" height="25" />
            <rect fill="#fff" x="13" y="68" width="19" height="19" />
            <rect fill="#000" x="16" y="71" width="13" height="13" />

            {/* Random pattern */}
            <rect fill="#000" x="40" y="10" width="5" height="5" />
            <rect fill="#000" x="50" y="15" width="5" height="5" />
            <rect fill="#000" x="45" y="20" width="5" height="5" />
            <rect fill="#000" x="40" y="25" width="5" height="5" />
            <rect fill="#000" x="50" y="30" width="5" height="5" />

            <rect fill="#000" x="10" y="40" width="5" height="5" />
            <rect fill="#000" x="20" y="45" width="5" height="5" />
            <rect fill="#000" x="15" y="50" width="5" height="5" />
            <rect fill="#000" x="25" y="55" width="5" height="5" />

            <rect fill="#000" x="40" y="40" width="20" height="20" />
            <rect fill="#fff" x="43" y="43" width="14" height="14" />
            <rect fill="#000" x="46" y="46" width="8" height="8" />

            <rect fill="#000" x="65" y="45" width="5" height="5" />
            <rect fill="#000" x="75" y="40" width="5" height="5" />
            <rect fill="#000" x="70" y="55" width="5" height="5" />
            <rect fill="#000" x="80" y="50" width="5" height="5" />

            <rect fill="#000" x="40" y="70" width="5" height="5" />
            <rect fill="#000" x="50" y="75" width="5" height="5" />
            <rect fill="#000" x="45" y="80" width="5" height="5" />
            <rect fill="#000" x="55" y="85" width="5" height="5" />

            <rect fill="#000" x="65" y="70" width="5" height="5" />
            <rect fill="#000" x="75" y="75" width="5" height="5" />
            <rect fill="#000" x="70" y="80" width="5" height="5" />
            <rect fill="#000" x="80" y="85" width="5" height="5" />
          </svg>

          {/* Coffee icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-amber-500 rounded-lg p-2">
              <Coffee className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-white mt-3">
          Scan with your banking app to pay
        </p>
      </div>
    )
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
                {writer.totalCoffees && (
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
                      setCustomAmount("")
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
                    <span className="text-sm font-medium">${amount * coffeePrice}</span>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label className="text-sm text-white">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white">
                    $
                  </span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    className="pl-7 border-border bg-card"
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
              Continue with ${totalAmount.toFixed(2)}
            </Button>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="flex items-center justify-center gap-2 text-xl">
                <Wallet className="h-6 w-6 text-primary" />
                Payment
              </DialogTitle>
              <DialogDescription className="text-center">
                Choose your payment method
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
                <p className="font-bold text-lg text-amber-500">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === "qr"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <QrCode className={`h-5 w-5 ${paymentMethod === "qr" ? "text-primary" : "text-white"}`} />
                  <span className="text-xs font-medium">QR Code</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === "wallet"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <Smartphone className={`h-5 w-5 ${paymentMethod === "wallet" ? "text-primary" : "text-white"}`} />
                  <span className="text-xs font-medium">E-Wallet</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === "card"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-primary" : "text-white"}`} />
                  <span className="text-xs font-medium">Card</span>
                </button>
              </div>

              {/* QR Code Payment */}
              {paymentMethod === "qr" && (
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
                  {generateQRCode()}

                  {writer.bankInfo && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-center">Bank Transfer Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded-lg bg-background">
                          <span className="text-white">Bank</span>
                          <span className="font-medium">{writer.bankInfo.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background">
                          <span className="text-white">Account No.</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{writer.bankInfo.accountNumber}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(writer.bankInfo!.accountNumber)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-background">
                          <span className="text-white">Name</span>
                          <span className="font-medium">{writer.bankInfo.accountName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* E-Wallet */}
              {paymentMethod === "wallet" && (
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <p className="text-sm text-center text-white">
                    Send to wallet address:
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background">
                    <span className="text-sm font-mono truncate flex-1">
                      {writer.walletAddress || "0xLaoDev...abc123"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopy(writer.walletAddress || "0xLaoDev...abc123")}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 border-border">
                      <ExternalLink className="h-4 w-4" />
                      BCEL One
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 border-border">
                      <ExternalLink className="h-4 w-4" />
                      U-Money
                    </Button>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === "card" && (
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Card Number</Label>
                    <Input placeholder="4242 4242 4242 4242" className="border-border bg-card font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Expiry</Label>
                      <Input placeholder="MM/YY" className="border-border bg-card" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">CVC</Label>
                      <Input placeholder="123" className="border-border bg-card" />
                    </div>
                  </div>
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
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Coffee className="h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
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
