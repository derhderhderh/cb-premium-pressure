"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Booking } from "@/lib/types"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  User,
  Hand,
  Ruler,
  DollarSign,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
} from "lucide-react"
import { cn, toDate } from "@/lib/utils"

interface JobCardProps {
  booking: Booking
  onStatusUpdate?: (bookingId: string, newStatus: Booking["status"]) => Promise<void>
  onClaim?: (bookingId: string) => Promise<void>
  currentUserId?: string
  isUpdating?: boolean
}

const statusConfig = {
  pending: { label: "Pending", variant: "warning" as const, className: "bg-warning text-warning-foreground" },
  accepted: { label: "Accepted", variant: "info" as const, className: "bg-info text-info-foreground" },
  declined: { label: "Declined", variant: "destructive" as const, className: "bg-destructive text-destructive-foreground" },
  in_progress: { label: "In Progress", variant: "default" as const, className: "bg-primary text-primary-foreground" },
  completed: { label: "Completed", variant: "success" as const, className: "bg-success text-success-foreground" },
}

export function JobCard({ booking, onStatusUpdate, onClaim, currentUserId, isUpdating }: JobCardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const status = statusConfig[booking.status]
  const isClaimedByCurrentUser = Boolean(currentUserId && booking.assignedWorker === currentUserId)
  const isUnclaimed = !booking.assignedWorker

  const handleStatusUpdate = async (newStatus: Booking["status"]) => {
    if (!onStatusUpdate) return
    setLoading(newStatus)
    try {
      await onStatusUpdate(booking.id, newStatus)
    } finally {
      setLoading(null)
    }
  }

  const handleClaim = async () => {
    if (!onClaim) return
    setLoading("claim")
    try {
      await onClaim(booking.id)
    } finally {
      setLoading(null)
    }
  }

  const getActionButtons = () => {
    if (booking.status === "pending" && isUnclaimed) {
      return (
        <Button
          size="sm"
          onClick={handleClaim}
          disabled={loading !== null || isUpdating}
        >
          <Hand className="mr-1.5 h-4 w-4" />
          {loading === "claim" ? "Claiming..." : "Claim Job"}
        </Button>
      )
    }

    if (!isClaimedByCurrentUser) {
      return null
    }

    switch (booking.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate("accepted")}
              disabled={loading !== null || isUpdating}
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              {loading === "accepted" ? "Accepting..." : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate("declined")}
              disabled={loading !== null || isUpdating}
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              {loading === "declined" ? "Declining..." : "Decline"}
            </Button>
          </div>
        )
      case "accepted":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={loading !== null || isUpdating}
          >
            <PlayCircle className="mr-1.5 h-4 w-4" />
            {loading === "in_progress" ? "Starting..." : "Start Job"}
          </Button>
        )
      case "in_progress":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate("completed")}
            disabled={loading !== null || isUpdating}
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            {loading === "completed" ? "Completing..." : "Mark Complete"}
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {booking.customerName}
            </CardTitle>
            <CardDescription className="mt-1 capitalize">
              {booking.serviceType.replace("_", " ")} Service
            </CardDescription>
          </div>
          <Badge className={cn("shrink-0", status.className)}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Details Grid */}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {format(toDate(booking.preferredDate), "PPP")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{booking.preferredTime || "No time specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-4 w-4 shrink-0" />
            <span>{booking.squareFootage.toLocaleString()} sq ft</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">
              ${booking.estimatedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{booking.address}</span>
        </div>

        {/* Contact */}
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href={`mailto:${booking.email}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            {booking.email}
          </a>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="rounded-lg bg-secondary/50 p-3 text-sm">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <FileText className="h-4 w-4" />
              Notes
            </div>
            <p className="text-muted-foreground">{booking.notes}</p>
          </div>
        )}

        {/* Actions */}
        {getActionButtons() && (
          <div className="border-t border-border pt-4">{getActionButtons()}</div>
        )}
      </CardContent>
    </Card>
  )
}
