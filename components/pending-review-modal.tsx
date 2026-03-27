import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock } from "lucide-react"

interface PendingReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PendingReviewModal({ open, onOpenChange }: PendingReviewModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-amber-500/20 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Account Under Review</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your developer account is currently being reviewed by our team. You will be able to use this feature once your account has been approved. This usually takes 1-2 business days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
