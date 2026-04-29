"use client"

import { useState, useEffect } from "react"
import { getAllBookings, getAllUsers, updateBookingStatus, assignWorkerToBooking } from "@/lib/db"
import { BookingsTable } from "@/components/dashboard/bookings-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Booking, User } from "@/lib/types"

export default function AdminBookingsPage() {
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
        setError("Failed to load bookings")
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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
        <p className="text-muted-foreground">
          Manage all booking requests and assignments.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            {bookings.length} total bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable
            bookings={bookings}
            workers={workers}
            onStatusUpdate={handleStatusUpdate}
            onAssignWorker={handleAssignWorker}
          />
        </CardContent>
      </Card>
    </div>
  )
}
