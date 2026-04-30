"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarIcon, CheckCircle, Send, MessageCircle, Smartphone } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { ServiceType } from "@/lib/types"
import { validateBookingForm } from "@/lib/validations"

interface BookingFormProps {
  selectedService: ServiceType
  squareFootage: number
  estimatedPrice: number
}

const timeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
]

export function BookingForm({ selectedService, squareFootage, estimatedPrice }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [date, setDate] = useState<Date>()

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    preferredTime: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, preferredTime: value }))
    if (errors.preferredTime) {
      setErrors((prev) => ({ ...prev, preferredTime: "" }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validate form
    const validation = validateBookingForm({
      ...formData,
      serviceType: selectedService,
      squareFootage,
      preferredDate: date,
    })

    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...formData,
          serviceType: selectedService,
          squareFootage,
          estimatedPrice,
          preferredDate: date?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to submit booking")
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Booking error:", error)
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Booking request timed out. Please check your connection and try again."
          : error instanceof Error
            ? error.message
            : "Failed to submit booking. Please try again."
      setErrors({ submit: message })
    } finally {
      window.clearTimeout(timeoutId)
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-foreground">Booking Request Submitted!</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            Thank you for choosing CB Premium Pressure. We&apos;ve received your booking request and will confirm your appointment shortly.
          </p>
          
          {/* Worker contact notice - per user requirement */}
          <Alert className="mb-6 max-w-md border-accent bg-accent/10">
            <Smartphone className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Expect a Text Message
            </AlertTitle>
            <AlertDescription>
              One of our team members will text you directly to confirm the details and answer any questions you may have.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg bg-secondary/50 p-6 text-left">
            <h4 className="mb-3 font-semibold text-foreground">Booking Summary</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service:</dt>
                <dd className="font-medium capitalize text-foreground">
                  {selectedService.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Area:</dt>
                <dd className="font-medium text-foreground">{squareFootage} sq ft</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated Price:</dt>
                <dd className="font-medium text-primary">${estimatedPrice.toFixed(2)}</dd>
              </div>
              {date && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Preferred Date:</dt>
                  <dd className="font-medium text-foreground">{format(date, "PPP")}</dd>
                </div>
              )}
            </dl>
          </div>

          <Button className="mt-6" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
        <CardDescription>
          Fill in your details below to request your pressure washing service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={errors.customerName ? "border-destructive" : ""}
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State"
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Preferred Schedule</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.preferredDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < addDays(new Date(), 1)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.preferredDate && (
                  <p className="text-sm text-destructive">{errors.preferredDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select value={formData.preferredTime} onValueChange={handleTimeChange}>
                  <SelectTrigger className={errors.preferredTime ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferredTime && (
                  <p className="text-sm text-destructive">{errors.preferredTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions, access codes, or concerns..."
              rows={3}
            />
          </div>

          {/* Quote Summary */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <h4 className="mb-3 font-semibold text-foreground">Quote Summary</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service:</dt>
                <dd className="font-medium capitalize text-foreground">
                  {selectedService.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Area:</dt>
                <dd className="font-medium text-foreground">{squareFootage} sq ft</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="font-semibold text-foreground">Estimated Total:</dt>
                <dd className="text-xl font-bold text-primary">${estimatedPrice.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Booking Request
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you agree to be contacted by our team. Final pricing will be confirmed after inspection.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
