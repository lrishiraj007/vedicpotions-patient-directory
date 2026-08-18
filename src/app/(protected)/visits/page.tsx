import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VisitsFilters } from "./visits-filters"
import { VisitsLog } from "./visits-log"
import { Plus } from "lucide-react"

interface VisitsPageProps {
  searchParams: Promise<{
    patient?: string
    location?: string
    payment?: string
    from?: string
    to?: string
  }>
}

export default async function VisitsPage({ searchParams }: VisitsPageProps) {
  const session = await getAuthSession()
  const resolvedParams = await searchParams
  const patientQuery = resolvedParams.patient || ""
  const locationQuery = resolvedParams.location || ""
  const paymentQuery = resolvedParams.payment || ""
  const fromQuery = resolvedParams.from || ""
  const toQuery = resolvedParams.to || ""

  // Build Prisma query filters dynamically
  const whereClause: any = {}

  if (patientQuery) {
    whereClause.patient = {
      name: {
        contains: patientQuery,
        mode: "insensitive",
      },
    }
  }

  if (locationQuery) {
    whereClause.location = locationQuery
  }

  if (paymentQuery) {
    if (paymentQuery === "paid") {
      whereClause.paymentMethod = {
        notIn: ["Not Paid", "not paid", "Unpaid"],
      }
    } else if (paymentQuery === "unpaid") {
      whereClause.paymentMethod = {
        in: ["Not Paid", "not paid", "Unpaid"],
      }
    }
  }

  if (fromQuery || toQuery) {
    whereClause.date = {}
    if (fromQuery) {
      whereClause.date.gte = new Date(fromQuery)
    }
    if (toQuery) {
      const toDateObj = new Date(toQuery)
      toDateObj.setHours(23, 59, 59, 999)
      whereClause.date.lte = toDateObj
    }
  }

  // Fetch filtered visits list
  const visits = await prisma.visit.findMany({
    where: whereClause,
    orderBy: {
      date: "desc",
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Clinical Logs</h1>
          <p className="text-muted-foreground text-sm">
            View full log histories, clinical entries, and payment status details.
          </p>
        </div>
        <Link href="/visits/new" passHref>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
            <Plus className="h-4 w-4" /> New Visit Log
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <VisitsFilters />

      {/* Expandable Logs Table */}
      <VisitsLog visits={visits} isAdmin={session?.isAdmin || false} />
    </div>
  )
}
