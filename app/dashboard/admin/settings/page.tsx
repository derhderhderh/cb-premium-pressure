"use client"

import { useEffect, useState } from "react"
import { getSettings, updateSettings } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Building, Mail, MapPin, Clock, CheckCircle } from "lucide-react"
import {
  DEFAULT_BOOKING_AVAILABILITY,
  formatAvailability,
  normalizeAvailability,
  WEEKDAYS,
} from "@/lib/availability"

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingAvailability, setBookingAvailability] = useState<number[]>(DEFAULT_BOOKING_AVAILABILITY)

  const [settings, setSettings] = useState({
    businessName: "CB Premium Pressure",
    email: "contact@cbpremiumpressure.org",
    address: "Serving Allen, Texas",
    businessHours: "Monday - Saturday: 7:00 AM - 7:00 PM\nSunday: Closed",
    serviceArea: "Serving Allen, Texas and surrounding communities.",
    taxRate: 0,
  })

  useEffect(() => {
    async function loadBookingAvailability() {
      try {
        const savedSettings = await getSettings()
        setBookingAvailability(
          normalizeAvailability(savedSettings?.bookingAvailability)
        )
      } catch (err) {
        console.error("Error loading booking availability:", err)
        setError("Failed to load booking availability")
      }
    }

    loadBookingAvailability()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
    setSuccess(false)
  }

  const handleToggleBookingDay = (day: number) => {
    setBookingAvailability((current) => {
      const normalized = normalizeAvailability(current)
      return normalized.includes(day)
        ? normalized.filter((availableDay) => availableDay !== day)
        : normalizeAvailability([...normalized, day])
    })
    setSuccess(false)
    setError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const normalizedAvailability = normalizeAvailability(bookingAvailability)
      await updateSettings({ bookingAvailability: normalizedAvailability })

      setBookingAvailability(normalizedAvailability)
      setSuccess(true)
    } catch (err) {
      console.error("Error saving booking availability:", err)
      setError("Failed to save booking availability")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Business Settings</h1>
        <p className="text-muted-foreground">
          Configure your business information and preferences.
        </p>
      </div>

      {success && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Your business details shown on the website and in communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={settings.businessName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="mr-1 inline h-3 w-3" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="mr-1 inline h-3 w-3" />
                Business Address
              </Label>
              <Input
                id="address"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
            <CardDescription>
              Set your business hours and service area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessHours">Business Hours</Label>
              <Textarea
                id="businessHours"
                name="businessHours"
                value={settings.businessHours}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Area</Label>
              <Textarea
                id="serviceArea"
                name="serviceArea"
                value={settings.serviceArea}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Booking Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Booking Availability
            </CardTitle>
            <CardDescription>
              Choose which weekdays customers are allowed to book.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={bookingAvailability.includes(day.value)}
                    onCheckedChange={() => handleToggleBookingDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Current bookable days: {formatAvailability(bookingAvailability)}
            </p>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Settings</CardTitle>
            <CardDescription>
              Configure tax rates and payment preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={handleInputChange}
                min={0}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 if tax is not applicable or will be calculated separately.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
