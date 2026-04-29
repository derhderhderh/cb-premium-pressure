"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Home, Car, Trees, Building2, Fence, Footprints, Trash2, Calculator } from "lucide-react"
import { ServiceType } from "@/lib/types"
import { calculateQuote } from "@/lib/pricing"
import { cn } from "@/lib/utils"

const serviceOptions = [
  { value: "driveway" as ServiceType, label: "Driveway", icon: Car },
  { value: "house_exterior" as ServiceType, label: "House Exterior", icon: Home },
  { value: "deck" as ServiceType, label: "Deck", icon: Trees },
  { value: "patio" as ServiceType, label: "Patio", icon: Trees },
  { value: "fence" as ServiceType, label: "Fence", icon: Fence },
  { value: "sidewalk" as ServiceType, label: "Sidewalk", icon: Footprints },
  { value: "trashcan" as ServiceType, label: "Trashcan", icon: Trash2 },
  { value: "commercial" as ServiceType, label: "Commercial", icon: Building2 },
]

interface QuoteCalculatorProps {
  initialService?: ServiceType
  onQuoteCalculated?: (quote: { service: ServiceType; sqft: number; price: number }) => void
}

export function QuoteCalculator({ initialService, onQuoteCalculated }: QuoteCalculatorProps) {
  const [selectedService, setSelectedService] = useState<ServiceType>(initialService || "driveway")
  const [squareFootage, setSquareFootage] = useState(500)

  const estimatedPrice = useMemo(() => {
    return calculateQuote(selectedService, squareFootage)
  }, [selectedService, squareFootage])

  const handleServiceChange = (value: string) => {
    const service = value as ServiceType
    setSelectedService(service)
    onQuoteCalculated?.({ service, sqft: squareFootage, price: calculateQuote(service, squareFootage) })
  }

  const handleSquareFootageChange = (value: number[]) => {
    const sqft = value[0]
    setSquareFootage(sqft)
    onQuoteCalculated?.({ service: selectedService, sqft, price: calculateQuote(selectedService, sqft) })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(10000, parseInt(e.target.value) || 0))
    setSquareFootage(value)
    onQuoteCalculated?.({ service: selectedService, sqft: value, price: calculateQuote(selectedService, value) })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Calculator className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle>Instant Quote Calculator</CardTitle>
            <CardDescription>Get an estimate in seconds</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Service Selection */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Select Service Type</Label>
          <RadioGroup
            value={selectedService}
            onValueChange={handleServiceChange}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {serviceOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-secondary/50",
                  selectedService === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                <option.icon
                  className={cn(
                    "h-6 w-6",
                    selectedService === option.value ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    selectedService === option.value ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Square Footage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Square Footage</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={squareFootage}
                onChange={handleInputChange}
                className="w-24 text-right"
                min={0}
                max={10000}
              />
              <span className="text-sm text-muted-foreground">sq ft</span>
            </div>
          </div>
          <Slider
            value={[squareFootage]}
            onValueChange={handleSquareFootageChange}
            min={100}
            max={5000}
            step={50}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 sq ft</span>
            <span>5,000 sq ft</span>
          </div>
        </div>

        {/* Estimated Price */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-6 text-center text-primary-foreground">
          <p className="mb-1 text-sm font-medium opacity-90">Estimated Price</p>
          <p className="text-4xl font-bold">${estimatedPrice.toFixed(2)}</p>
          <p className="mt-2 text-xs opacity-75">
            Final price may vary based on condition and accessibility
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
