import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Home, Car, Trees, Building2, Fence, Footprints, Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Our Services | CB Premium Pressure",
  description: "Professional pressure washing services for driveways, house exteriors, decks, patios, fences, and commercial properties.",
}

const services = [
  {
    id: "driveway",
    icon: Car,
    title: "Driveway Cleaning",
    description: "Restore your driveway to its original pristine condition. We remove oil stains, tire marks, dirt, mold, and algae buildup that accumulate over time.",
    startingPrice: "$75",
    pricePerSqFt: "$0.15",
    features: [
      "Oil stain removal",
      "Mold and algae treatment",
      "Concrete brightening",
      "Sealer application available",
    ],
    popular: true,
  },
  {
    id: "house",
    icon: Home,
    title: "House Exterior",
    description: "Boost your home&apos;s curb appeal with our safe and effective house washing service. We clean all types of siding including vinyl, brick, stucco, and wood.",
    startingPrice: "$150",
    pricePerSqFt: "$0.25",
    features: [
      "Soft wash technique for delicate surfaces",
      "Safe for all siding types",
      "Window cleaning included",
      "Gutter brightening available",
    ],
    popular: false,
  },
  {
    id: "deck",
    icon: Trees,
    title: "Deck & Patio Cleaning",
    description: "Revive your outdoor living spaces. We safely clean wood, composite, and concrete decks and patios, removing years of weathering, mold, and mildew.",
    startingPrice: "$60",
    pricePerSqFt: "$0.12",
    features: [
      "Wood and composite safe",
      "Mold and mildew removal",
      "Stain preparation available",
      "Sealing services offered",
    ],
    popular: false,
  },
  {
    id: "fence",
    icon: Fence,
    title: "Fence Cleaning",
    description: "Bring your fence back to life. Whether it&apos;s wood, vinyl, or metal, we&apos;ll restore it to look like new without damaging the material.",
    startingPrice: "$80",
    pricePerSqFt: "$0.18",
    features: [
      "All fence materials",
      "Gentle pressure settings",
      "Stain and seal prep",
      "Both sides cleaned",
    ],
    popular: false,
  },
  {
    id: "sidewalk",
    icon: Footprints,
    title: "Sidewalks & Walkways",
    description: "Keep your pathways clean and safe. We remove slippery buildup, gum, stains, and years of foot traffic grime from concrete and pavers.",
    startingPrice: "$40",
    pricePerSqFt: "$0.10",
    features: [
      "Gum removal",
      "Trip hazard prevention",
      "Paver cleaning",
      "Hot water available",
    ],
    popular: false,
  },
  {
    id: "trashcan",
    icon: Trash2,
    title: "Trashcan Cleaning",
    description: "Eliminate foul odors, bacteria, and pests with our professional trashcan sanitization service. We use high-pressure hot water and eco-friendly sanitizers.",
    startingPrice: "$25",
    pricePerSqFt: "Per can",
    features: [
      "Hot water sanitization",
      "Odor elimination",
      "Bacteria and germ removal",
      "Eco-friendly products",
    ],
    popular: false,
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial Services",
    description: "Keep your business looking professional with our commercial pressure washing services. We offer flexible scheduling including nights and weekends.",
    startingPrice: "$200",
    pricePerSqFt: "$0.20",
    features: [
      "Storefronts and entrances",
      "Parking lots and garages",
      "Dumpster pad cleaning",
      "Maintenance contracts available",
    ],
    popular: false,
  },
]

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Our Services
              </h1>
              <p className="text-lg text-muted-foreground">
                From residential driveways to commercial properties, we offer a complete range of professional pressure washing services.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  id={service.id}
                  className="relative overflow-hidden scroll-mt-24"
                >
                  {service.popular && (
                    <Badge className="absolute right-4 top-4">Most Popular</Badge>
                  )}
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <service.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="flex items-baseline gap-4 rounded-lg bg-secondary/50 p-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Starting at</span>
                        <p className="text-2xl font-bold text-foreground">{service.startingPrice}</p>
                      </div>
                      <div className="border-l border-border pl-4">
                        <span className="text-sm text-muted-foreground">
                          {service.id === "trashcan" ? "Rate" : "Per sq ft"}
                        </span>
                        <p className="text-lg font-semibold text-foreground">{service.pricePerSqFt}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button asChild className="w-full">
                      <Link href={`/book?service=${service.id}`}>
                        Get a Quote for {service.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Not Sure What You Need?
              </h2>
              <p className="mb-8 text-primary-foreground/80">
                No problem! Use our instant quote calculator to get a customized estimate for your property in Allen, Texas.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/book">
                  Get Instant Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
