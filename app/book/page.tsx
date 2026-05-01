"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { QuoteCalculator } from "@/components/booking/quote-calculator"
import { BookingForm } from "@/components/booking/booking-form"
import { ServiceType } from "@/lib/types"
import { calculateQuote } from "@/lib/pricing"

function BookPageContent() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service") as ServiceType | null

  const [quoteData, setQuoteData] = useState({
    service: (serviceParam || "driveway") as ServiceType,
    sqft: serviceParam === "trashcan" ? 1 : 500,
    price: 0,
  })

  // Calculate initial price
  useEffect(() => {
    const initialPrice = calculateQuote(quoteData.service, quoteData.sqft)
    setQuoteData((prev) => ({ ...prev, price: initialPrice }))
  }, [])

  const handleQuoteCalculated = (data: { service: ServiceType; sqft: number; price: number }) => {
    setQuoteData(data)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Get Your Free Quote
              </h1>
              <p className="text-lg text-muted-foreground">
                Use our calculator to get an instant estimate, then complete the form to book your service.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
              {/* Quote Calculator */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <QuoteCalculator
                  initialService={serviceParam || undefined}
                  onQuoteCalculated={handleQuoteCalculated}
                />
              </div>

              {/* Booking Form */}
              <BookingForm
                selectedService={quoteData.service}
                squareFootage={quoteData.sqft}
                estimatedPrice={quoteData.price}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookPageContent />
    </Suspense>
  )
}
