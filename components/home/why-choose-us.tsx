import { Shield, Clock, ThumbsUp, DollarSign, Award, Leaf } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Fully Insured",
    description: "We&apos;re fully licensed and insured, giving you peace of mind on every job.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book online 24/7 and choose a time that works best for your schedule.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    description: "Not happy with the results? We&apos;ll come back and make it right, free of charge.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Get an instant quote upfront with no hidden fees or surprise charges.",
  },
  {
    icon: Award,
    title: "Experienced Team",
    description: "Our trained professionals have years of experience in pressure washing.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "We use environmentally safe cleaning solutions that won&apos;t harm your landscaping.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose CB Premium Pressure?
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;re committed to delivering exceptional results and outstanding customer service on every project.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
