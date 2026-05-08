"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { QuoteCalculator } from "@/components/booking/quote-calculator"
import { BookingForm } from "@/components/booking/booking-form"
import { BookingServiceItem, SERVICE_LABELS, ServiceType } from "@/lib/types"
import { calculateQuote } from "@/lib/pricing"

function BookPageContent() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")
  const selectedInitialService = (
    serviceParam && serviceParam in SERVICE_LABELS ? serviceParam : "driveway"
  ) as ServiceType

  const [quoteData, setQuoteData] = useState({
    services: [
      {
        serviceType: selectedInitialService,
        quantity: selectedInitialService === "trashcan" ? 1 : 500,
        estimatedPrice: 0,
      },
    ] as BookingServiceItem[],
    price: 0,
  })

  // Calculate initial price
  useEffect(() => {
    const initialServices = quoteData.services.map((service) => ({
      ...service,
      estimatedPrice: calculateQuote(service.serviceType, service.quantity),
    }))
    setQuoteData({
      services: initialServices,
      price: initialServices.reduce((sum, service) => sum + service.estimatedPrice, 0),
    })
  }, [])

  const handleQuoteCalculated = (data: { services: BookingServiceItem[]; price: number }) => {
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
                  initialService={selectedInitialService}
                  onQuoteCalculated={handleQuoteCalculated}
                />
              </div>

              {/* Booking Form */}
              <BookingForm
                services={quoteData.services}
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
