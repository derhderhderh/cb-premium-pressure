"use client"

import { useState, useEffect } from "react"
import { getPricing, updatePricing } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pricing, ServiceType } from "@/lib/types"
import { DEFAULT_PRICING } from "@/lib/pricing"
import { Save, RefreshCw, DollarSign, CheckCircle } from "lucide-react"

const serviceLabels: Record<ServiceType, string> = {
  driveway: "Driveway Cleaning",
  house_exterior: "House Exterior",
  deck: "Deck Cleaning",
  patio: "Patio Cleaning",
  fence: "Fence Cleaning",
  sidewalk: "Sidewalk Cleaning",
  trashcan: "Trashcan Cleaning",
  commercial: "Commercial Services",
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await getPricing()
        if (data.length === 0) {
          // Use default pricing if none exists
          const defaultPricingData = Object.entries(DEFAULT_PRICING).map(([key, value]) => ({
            id: key,
            serviceType: key as ServiceType,
            description: serviceLabels[key as ServiceType],
            ...value,
            updatedAt: new Date(),
            updatedBy: "",
          }))
          setPricing(defaultPricingData)
        } else {
          setPricing(data)
        }
      } catch (err) {
        console.error("Error fetching pricing:", err)
        setError("Failed to load pricing")
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  const handleInputChange = (
    serviceType: ServiceType,
    field: "basePrice" | "pricePerSqFt" | "minPrice",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0
    setPricing((prev) =>
      prev.map((p) =>
        p.serviceType === serviceType ? { ...p, [field]: numValue } : p
      )
    )
    setSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await Promise.all(
        pricing.map((p) =>
          updatePricing(p.serviceType, {
            basePrice: p.basePrice,
            pricePerSqFt: p.pricePerSqFt,
            minPrice: p.minPrice,
          })
        )
      )
      setSuccess(true)
    } catch (err) {
      console.error("Error saving pricing:", err)
      setError("Failed to save pricing")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const defaultPricingData = Object.entries(DEFAULT_PRICING).map(([key, value]) => ({
      id: key,
      serviceType: key as ServiceType,
      description: serviceLabels[key as ServiceType],
      ...value,
      updatedAt: new Date(),
      updatedBy: "",
    }))
    setPricing(defaultPricingData)
    setSuccess(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing Configuration</h1>
          <p className="text-muted-foreground">
            Set base prices and per-square-foot rates for each service.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Pricing updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {pricing.map((p) => (
          <Card key={p.serviceType}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {serviceLabels[p.serviceType]}
              </CardTitle>
              <CardDescription>
                Configure pricing for {serviceLabels[p.serviceType].toLowerCase()} services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`${p.serviceType}-base`}>Base Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id={`${p.serviceType}-base`}
                      type="number"
                      value={p.basePrice}
                      onChange={(e) =>
                        handleInputChange(p.serviceType, "basePrice", e.target.value)
                      }
                      className="pl-7"
                      min={0}
                      step={5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${p.serviceType}-sqft`}>
                    {p.serviceType === "trashcan" ? "Per Can" : "Per Sq Ft"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id={`${p.serviceType}-sqft`}
                      type="number"
                      value={p.pricePerSqFt}
                      onChange={(e) =>
                        handleInputChange(p.serviceType, "pricePerSqFt", e.target.value)
                      }
                      className="pl-7"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${p.serviceType}-min`}>Min Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id={`${p.serviceType}-min`}
                      type="number"
                      value={p.minPrice}
                      onChange={(e) =>
                        handleInputChange(p.serviceType, "minPrice", e.target.value)
                      }
                      className="pl-7"
                      min={0}
                      step={5}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Formula: Base (${p.basePrice}) + ({p.serviceType === "trashcan" ? "Cans" : "Area"} × ${p.pricePerSqFt}/{p.serviceType === "trashcan" ? "can" : "sq ft"}), minimum ${p.minPrice}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
