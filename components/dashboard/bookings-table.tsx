"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Booking, User } from "@/lib/types"
import { format } from "date-fns"
import { Hand, MoreHorizontal, Search } from "lucide-react"
import { cn, toDate } from "@/lib/utils"

interface BookingsTableProps {
  bookings: Booking[]
  workers: User[]
  currentUserId?: string
  onStatusUpdate: (bookingId: string, newStatus: Booking["status"]) => Promise<void>
  onClaimBooking?: (bookingId: string) => Promise<void>
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning text-warning-foreground" },
  accepted: { label: "Accepted", className: "bg-info text-info-foreground" },
  declined: { label: "Declined", className: "bg-destructive text-destructive-foreground" },
  in_progress: { label: "In Progress", className: "bg-primary text-primary-foreground" },
  completed: { label: "Completed", className: "bg-success text-success-foreground" },
}

export function BookingsTable({
  bookings,
  workers,
  currentUserId,
  onStatusUpdate,
  onClaimBooking,
}: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Claimed By</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const status = statusConfig[booking.status]
                const assignedWorker = workers.find((w) => w.id === booking.assignedWorker)

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {booking.serviceType.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      {format(toDate(booking.preferredDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>${booking.estimatedPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn("font-medium", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {assignedWorker?.name || "Unclaimed"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {booking.status === "pending" && (
                            <>
                              {!booking.assignedWorker && onClaimBooking && (
                                <DropdownMenuItem onClick={() => onClaimBooking(booking.id)}>
                                  <Hand className="mr-2 h-4 w-4" />
                                  Claim
                                </DropdownMenuItem>
                              )}
                              {booking.assignedWorker === currentUserId && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onStatusUpdate(booking.id, "accepted")}
                                  >
                                    Accept
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onStatusUpdate(booking.id, "declined")}
                                  >
                                    Decline
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          {booking.status === "accepted" && booking.assignedWorker === currentUserId && (
                            <DropdownMenuItem
                              onClick={() => onStatusUpdate(booking.id, "in_progress")}
                            >
                              Start Job
                            </DropdownMenuItem>
                          )}
                          {booking.status === "in_progress" && booking.assignedWorker === currentUserId && (
                            <DropdownMenuItem
                              onClick={() => onStatusUpdate(booking.id, "completed")}
                            >
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
