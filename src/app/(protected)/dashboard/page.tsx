import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth, format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Calendar, IndianRupee, MapPin, AlertCircle, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  // Fetch active clinician session
  await getAuthSession()

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  // 1. Fetch visits count for the current month
  const monthlyVisitsCount = await prisma.visit.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  })

  // 2. Fetch monthly revenue
  const revenueAggregation = await prisma.visit.aggregate({
    _sum: {
      paymentAmount: true,
    },
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  })
  const monthlyRevenue = revenueAggregation._sum.paymentAmount || 0

  // 3. Fetch unpaid visits count in current month
  const unpaidVisitsCount = await prisma.visit.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      paymentMethod: {
        in: ["Not Paid", "not paid", "Unpaid"],
      },
    },
  })

  // 4. Group visits by location (all time)
  const visitsByLocationRaw = await prisma.visit.groupBy({
    by: ['location'],
    _count: {
      id: true,
    },
  })

  const totalVisitsAllTime = visitsByLocationRaw.reduce((sum, item) => sum + item._count.id, 0)
  const visitsByLocation = visitsByLocationRaw
    .map(item => ({
      location: item.location,
      count: item._count.id,
      percentage: totalVisitsAllTime > 0 ? Math.round((item._count.id / totalVisitsAllTime) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // 5. Fetch recent 10 visits
  const recentVisits = await prisma.visit.findMany({
    take: 10,
    orderBy: {
      date: 'desc',
    },
    include: {
      patient: true,
    },
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of clinical activities and payments for {format(now, 'MMMM yyyy')}.
          </p>
        </div>
        <Link href="/visits/new" passHref>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg">
            <Plus className="h-5 w-5" /> New Visit
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Visits */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visits This Month</span>
              <p className="text-3xl font-extrabold text-foreground">{monthlyVisitsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
              <p className="text-3xl font-extrabold text-foreground">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Visits */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unpaid (This Month)</span>
              <p className="text-3xl font-extrabold text-foreground">{unpaidVisitsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Location breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 md:col-span-1 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-foreground text-base">Clinics / Locations</h3>
            <p className="text-xs text-muted-foreground">Visits breakdown by location (all time)</p>
          </div>

          <div className="space-y-4">
            {visitsByLocation.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No location metrics logged yet.</p>
            ) : (
              visitsByLocation.map((item) => (
                <div key={item.location} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> {item.location}
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-zinc-900 border border-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Recent visits log */}
        <div className="bg-card border border-border rounded-xl p-6 md:col-span-2 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-foreground text-base">Recent Visits</h3>
              <p className="text-xs text-muted-foreground">Most recent 10 visits logged.</p>
            </div>
            <Link href="/visits" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              All Visits <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {recentVisits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-12 text-center">No clinical visits logged yet.</p>
            ) : (
              recentVisits.map((visit) => (
                <div key={visit.id} className="py-3 flex items-center justify-between text-xs hover:bg-zinc-900/30 rounded px-2 transition-colors">
                  <div className="space-y-1">
                    <Link href={`/patients/${visit.patient.id}`} className="font-bold text-foreground hover:underline">
                      {visit.patient.name}
                    </Link>
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(visit.date), 'dd MMM yyyy')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {visit.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    {visit.paymentAmount !== null && (
                      <p className="font-semibold text-foreground">₹{visit.paymentAmount}</p>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      visit.paymentMethod === 'Not Paid' || visit.paymentMethod === 'Unpaid'
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {visit.paymentMethod || 'Not Paid'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
