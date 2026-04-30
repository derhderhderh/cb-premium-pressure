"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getWorkerBookings, updateBookingStatus } from "@/lib/db"
import { JobCard } from "@/components/dashboard/job-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Booking } from "@/lib/types"
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function WorkerDashboardPage() {
  const { user, userProfile } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return
      try {
        const data = await getWorkerBookings(user.uid)
        setBookings(data)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus, updatedAt: new Date() } : b))
      )
    } catch (err) {
      console.error("Error updating status:", err)
      throw err
    }
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const activeBookings = bookings.filter((b) => ["accepted", "in_progress"].includes(b.status))
  const completedBookings = bookings.filter((b) => ["completed", "declined"].includes(b.status))

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {userProfile?.name?.split(" ")[0] || "Worker"}
        </h1>
        <p className="text-muted-foreground">
          Here are your assigned jobs and pending requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Jobs Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingBookings.length > 0 && (
              <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <ClipboardList className="h-10 w-10" />
                </EmptyMedia>
                <EmptyTitle>No pending jobs</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have any pending job requests right now.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingBookings.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <Clock className="h-10 w-10" />
                </EmptyMedia>
                <EmptyTitle>No active jobs</EmptyTitle>
                <EmptyDescription>
                  Accept a pending job to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {activeBookings.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <CheckCircle className="h-10 w-10" />
                </EmptyMedia>
                <EmptyTitle>No completed jobs yet</EmptyTitle>
                <EmptyDescription>
                  Jobs you complete will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {completedBookings.map((booking) => (
                <JobCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
