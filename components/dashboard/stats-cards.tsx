import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, CheckCircle, Users, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: {
    totalBookings: number
    pendingBookings: number
    completedBookings: number
    totalRevenue: number
    activeWorkers: number
    bookingsTrend?: number
    revenueTrend?: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      description: `${stats.pendingBookings} pending`,
      trend: stats.bookingsTrend,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "This month",
      trend: stats.revenueTrend,
    },
    {
      title: "Completed Jobs",
      value: stats.completedBookings,
      icon: CheckCircle,
      description: "This month",
    },
    {
      title: "Active Workers",
      value: stats.activeWorkers,
      icon: Users,
      description: "Team members",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{card.description}</p>
              {card.trend !== undefined && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    card.trend >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {card.trend >= 0 ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {Math.abs(card.trend)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
