import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Car, Trees, Building2, Fence, Footprints, Trash2 } from "lucide-react"

const services = [
  {
    icon: Car,
    title: "Driveway Cleaning",
    description: "Remove oil stains, dirt, and grime to restore your driveway to its original condition.",
    href: "/services#driveway",
    startingPrice: "$75",
  },
  {
    icon: Home,
    title: "House Exterior",
    description: "Safely clean siding, brick, and stucco to boost your home&apos;s curb appeal.",
    href: "/services#house",
    startingPrice: "$150",
  },
  {
    icon: Trees,
    title: "Deck & Patio",
    description: "Revive your outdoor living spaces by removing mold, mildew, and weathering.",
    href: "/services#deck",
    startingPrice: "$60",
  },
  {
    icon: Building2,
    title: "Commercial",
    description: "Keep your business looking professional with regular pressure washing maintenance.",
    href: "/services#commercial",
    startingPrice: "$200",
  },
  {
    icon: Fence,
    title: "Fence Cleaning",
    description: "Restore wood, vinyl, or metal fences to their original beauty.",
    href: "/services#fence",
    startingPrice: "$80",
  },
  {
    icon: Footprints,
    title: "Sidewalks & Walkways",
    description: "Eliminate hazardous buildup and keep pathways clean and safe.",
    href: "/services#sidewalk",
    startingPrice: "$40",
  },
  {
    icon: Trash2,
    title: "Trashcan Cleaning",
    description: "Eliminate odors and bacteria with our deep trashcan sanitization service.",
    href: "/services#trashcan",
    startingPrice: "$25",
  },
]

export function ServicesPreview() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground">
            From driveways to commercial properties, we have the expertise to handle any pressure washing job.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Starting at <span className="font-semibold text-foreground">{service.startingPrice}</span>
                  </span>
                  <Link
                    href={service.href}
                    className="flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/book">
              Get Your Free Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
