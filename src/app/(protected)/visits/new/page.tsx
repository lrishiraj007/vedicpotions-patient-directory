import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { NewVisitForm } from "./new-visit-form"
import { ChevronLeft, ClipboardList } from "lucide-react"

interface NewVisitPageProps {
  searchParams: Promise<{
    patientId?: string
  }>
}

export default async function NewVisitPage({ searchParams }: NewVisitPageProps) {
  // Enforce session check
  await getAuthSession()
  
  const resolvedParams = await searchParams
  const patientId = resolvedParams.patientId

  let initialPatient = null
  if (patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        age: true,
        sex: true,
        contactNo: true,
      },
    })
    if (patient) {
      initialPatient = patient
    }
  }

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href={patientId ? `/patients/${patientId}` : "/visits"}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors w-fit font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> Cancel & Return
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-primary" /> New Visit Entry
        </h1>
        <p className="text-muted-foreground text-sm">
          Log a clinical consultation, diagnostics, ayurvedic recommendations, and payment status.
        </p>
      </div>

      {/* Visit Creator Form */}
      <NewVisitForm initialPatient={initialPatient} />
    </div>
  )
}
