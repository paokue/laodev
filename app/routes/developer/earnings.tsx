import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { Footer } from "@/components/footer"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Users,
  Wallet,
  BanknoteIcon,
} from "lucide-react"

const bottomBarItems = [
  { href: "/developer", label: "Home", icon: Home },
  { href: "/developer/bookings", label: "Bookings", icon: Calendar },
  { href: "/developer/posts", label: "Requests", icon: FileText },
  { href: "/developer/messages", label: "Messages", icon: MessageSquare },
  { href: "/developer/profile", label: "Profile", icon: Users },
]

const transactions = [
  {
    id: "1",
    client: "Khamla Sisavath",
    service: "React Code Review",
    amount: 45,
    fee: 4.5,
    net: 40.5,
    date: "Mar 20, 2026",
    status: "completed",
  },
  {
    id: "2",
    client: "Bounmy Phanthavong",
    service: "Career Mentorship",
    amount: 25,
    fee: 2.5,
    net: 22.5,
    date: "Mar 19, 2026",
    status: "completed",
  },
  {
    id: "3",
    client: "Souksamay Keomany",
    service: "AWS Infrastructure Setup",
    amount: 110,
    fee: 11,
    net: 99,
    date: "Mar 18, 2026",
    status: "completed",
  },
  {
    id: "4",
    client: "Phoukhong Manivong",
    service: "TypeScript Migration Help",
    amount: 55,
    fee: 5.5,
    net: 49.5,
    date: "Mar 15, 2026",
    status: "completed",
  },
  {
    id: "5",
    client: "Platform Withdrawal",
    service: "Bank Transfer",
    amount: -500,
    fee: 0,
    net: -500,
    date: "Mar 10, 2026",
    status: "withdrawn",
  },
]

const payoutMethods = [
  { id: "1", type: "Bank Transfer", last4: "4532", isDefault: true },
  { id: "2", type: "PayPal", last4: "gmail.com", isDefault: false },
]

export default function DeveloperEarningsPage() {
  const [period, setPeriod] = useState("month")

  const totalEarnings = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0)
  const totalFees = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.fee, 0)
  const totalNet = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.net, 0)
  const withdrawn = Math.abs(transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0))
  const availableBalance = totalNet - withdrawn

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType="developer"
        userName="Somsak Phommavong"
      />

      <main className="pb-20 pt-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My <span className="gradient-text">Earnings</span>
              </h1>
              <p className="mt-1 text-white">
                Track your income and withdrawals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Available Balance
                  </p>
                  <p className="text-3xl font-bold text-primary sm:text-4xl">
                    <AnimatedCounter end={availableBalance} duration={1500} decimals={2} /> Kip
                  </p>
                  <Button className="mt-2 gap-2">
                    <BanknoteIcon className="h-4 w-4" />
                    Withdraw
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white">Total Earned</p>
                  <p className="text-2xl font-bold">{totalEarnings.toFixed(2)} Kip</p>
                  <p className="text-sm text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    +12% from last month
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white">Platform Fees (10%)</p>
                  <p className="text-2xl font-bold">{totalFees.toFixed(2)} Kip</p>
                  <p className="text-sm text-white">
                    Net: {totalNet.toFixed(2)} Kip
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white">Withdrawn</p>
                  <p className="text-2xl font-bold">{withdrawn.toFixed(2)} Kip</p>
                  <p className="text-sm text-white">
                    1 withdrawal this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Transactions */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All your earnings and withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.amount > 0 ? "bg-emerald-500/10" : "bg-blue-500/10"
                            }`}>
                            {transaction.amount > 0 ? (
                              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.client}</p>
                            <p className="text-sm text-white">{transaction.service}</p>
                            <p className="text-xs text-white">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${transaction.amount > 0 ? "text-emerald-400" : "text-blue-400"
                              }`}>
                              {transaction.amount > 0 ? "+" : ""}{transaction.amount > 0 ? `${transaction.net.toFixed(2)} Kip` : `${transaction.amount.toFixed(2)} Kip`}
                            </p>
                            {transaction.amount > 0 && (
                              <p className="text-xs text-white">
                                Fee: {transaction.fee.toFixed(2)} Kip
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-blue-500/20 text-blue-400"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payout Methods */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Payout Methods</CardTitle>
                  <Button variant="ghost" size="sm">Add</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{method.type}</p>
                          <p className="text-xs text-white">
                            ****{method.last4}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Earnings by Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { service: "Code Review", amount: 180, percentage: 40 },
                    { service: "Mentorship", amount: 125, percentage: 28 },
                    { service: "Architecture", amount: 110, percentage: 24 },
                    { service: "Other", amount: 35, percentage: 8 },
                  ].map((item) => (
                    <div key={item.service}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.service}</span>
                        <span className="font-medium">{item.amount} Kip</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-border border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tip: Increase Earnings</p>
                      <p className="text-xs text-white">
                        Respond quickly to consultation requests to boost your acceptance rate and earnings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomBar items={bottomBarItems} />
    </div>
  )
}
