import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PatientForm } from "./patient-form"
import { VisitCard } from "./visit-card"
import { ChevronLeft, Plus, ClipboardList } from "lucide-react"

interface PatientDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const session = await getAuthSession()
  const resolvedParams = await params
  const patientId = resolvedParams.id

  // 1. Fetch Patient Info
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  })
  if (!patient) {
    notFound()
  }

  // 2. Fetch Patient Visits
  const visits = await prisma.visit.findMany({
    where: { patientId },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Back Link & Page Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/patients" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors w-fit font-semibold">
          <ChevronLeft className="h-4 w-4" /> Back to Patients
        </Link>
        
        <Link href={`/visits/new?patientId=${patient.id}`} passHref>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
            <Plus className="h-4 w-4" /> Add Visit Entry
          </Button>
        </Link>
      </div>

      {/* Patient Details Form Grid */}
      <PatientForm patient={patient} isAdmin={session?.isAdmin || false} />

      {/* Visits Accordion Timeline */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-primary" /> Visits Timeline
          </h3>
          <p className="text-xs text-muted-foreground">Historical list of visits logged for this patient (newest first).</p>
        </div>

        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="p-12 text-center text-sm bg-card border border-border/80 rounded-xl text-muted-foreground italic">
              No clinical visits logged yet for this patient.
            </div>
          ) : (
            visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} isAdmin={session?.isAdmin || false} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
