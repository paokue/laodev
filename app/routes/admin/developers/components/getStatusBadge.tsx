import { Badge } from "@/components/ui/badge"
import { Ban, CheckCircle2, Clock, XCircle } from "lucide-react"

export function getStatusBadge(status: string) {
   const s = status.toLowerCase()
   if (s === "pending") {
      return (
         <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending
         </Badge>
      )
   }
   if (s === "active" || s === "approved") {
      return (
         <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
         </Badge>
      )
   }
   if (s === "rejected") {
      return (
         <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
         </Badge>
      )
   }
   if (s === "suspended") {
      return (
         <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 text-orange-500">
            <Ban className="mr-1 h-3 w-3" />
            Suspended
         </Badge>
      )
   }
   return <Badge variant="secondary">{status}</Badge>
}