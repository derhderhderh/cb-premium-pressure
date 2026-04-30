"use client"

import { useState, useEffect } from "react"
import { getAllBookings, getAllUsers } from "@/lib/db"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { BookingsTable } from "@/components/dashboard/bookings-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Booking, User } from "@/lib/types"
import { updateBookingStatus, assignWorkerToBooking } from "@/lib/db"
import { toDate } from "@/lib/utils"

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [workers, setWorkers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsData, usersData] = await Promise.all([
          getAllBookings(),
          getAllUsers(),
        ])
        setBookings(bookingsData)
        setWorkers(usersData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus, updatedAt: new Date() } : b
        )
      )
    } catch (err) {
      console.error("Error updating status:", err)
      throw err
    }
  }

  const handleAssignWorker = async (bookingId: string, workerId: string) => {
    try {
      await assignWorkerToBooking(bookingId, workerId)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, assignedWorker: workerId, updatedAt: new Date() } : b
        )
      )
    } catch (err) {
      console.error("Error assigning worker:", err)
      throw err
    }
  }

  // Calculate stats
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    completedBookings: bookings.filter((b) => b.status === "completed").length,
    totalRevenue: bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.estimatedPrice, 0),
    activeWorkers: workers.filter((w) => w.active && w.role === "worker").length,
    bookingsTrend: 12,
    revenueTrend: 8,
  }

  // Recent bookings for quick view
  const recentBookings = [...bookings]
    .sort((a, b) => {
      const dateA = toDate(a.createdAt)
      const dateB = toDate(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 10)

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
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and bookings.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            Latest booking requests and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable
            bookings={recentBookings}
            workers={workers}
            onStatusUpdate={handleStatusUpdate}
            onAssignWorker={handleAssignWorker}
          />
        </CardContent>
      </Card>
    </div>
  )
}
