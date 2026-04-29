import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Transform Your Property?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Get your free, no-obligation quote today. Serving Allen, Texas and surrounding areas.
          </p>
          <Button size="lg" variant="secondary" asChild>
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
