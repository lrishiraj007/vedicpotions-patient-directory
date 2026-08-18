import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchInput } from "./search-input"
import { ArrowUpDown, Calendar, User } from "lucide-react"
import { CreatePatientDialog } from "./create-patient-dialog"

interface PatientsPageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
  }>
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  // Enforce session check
  await getAuthSession()
  
  const resolvedParams = await searchParams
  const searchVal = resolvedParams.search || ""
  const sortVal = resolvedParams.sort || "name_asc"

  // 1. Fetch matching patients
  const patientsRaw = await prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: searchVal, mode: "insensitive" } },
        { contactNo: { contains: searchVal, mode: "insensitive" } },
      ],
    },
    include: {
      visits: {
        select: {
          date: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  })

  // 2. Map statistics (Visit count & Last visit) and Sort
  let patients = patientsRaw.map((p) => {
    const visitsCount = p.visits.length
    const lastVisit = visitsCount > 0 ? p.visits[0].date : null
    return {
      ...p,
      visitsCount,
      lastVisit,
    }
  })

  // Apply sorting
  if (sortVal === "name_asc") {
    patients.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortVal === "name_desc") {
    patients.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortVal === "visits_desc") {
    patients.sort((a, b) => b.visitsCount - a.visitsCount)
  } else if (sortVal === "last_visit_desc") {
    patients.sort((a, b) => {
      if (!a.lastVisit) return 1
      if (!b.lastVisit) return -1
      return b.lastVisit.getTime() - a.lastVisit.getTime()
    })
  }

  // Construct next sort parameter link
  const getSortLink = (col: string) => {
    const params = new URLSearchParams()
    if (searchVal) params.set("search", searchVal)
    
    if (col === "name") {
      params.set("sort", sortVal === "name_asc" ? "name_desc" : "name_asc")
    } else if (col === "visits") {
      params.set("sort", "visits_desc")
    } else if (col === "last_visit") {
      params.set("sort", "last_visit_desc")
    }
    return `/patients?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Patients Directory</h1>
          <p className="text-muted-foreground text-sm">
            Search clinical directories, view logs, and create new records.
          </p>
        </div>
        
        {/* Create Patient Dialog */}
        <CreatePatientDialog />
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-4">
        <SearchInput defaultValue={searchVal} />
      </div>

      {/* Patients Table Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {patients.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground italic">
            No patients directory matching search criteria.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-900/40 border-b border-border/80">
              <TableRow>
                <TableHead className="w-[40%] text-foreground font-bold">
                  <Link href={getSortLink("name")} className="flex items-center gap-1 hover:text-emerald-400">
                    Patient Name <ArrowUpDown className="h-3 w-3" />
                  </Link>
                </TableHead>
                <TableHead className="w-[15%] text-foreground font-bold">Age / Sex</TableHead>
                <TableHead className="w-[20%] text-foreground font-bold">Contact No</TableHead>
                <TableHead className="w-[10%] text-foreground font-bold text-center">
                  <Link href={getSortLink("visits")} className="flex items-center justify-center gap-1 hover:text-emerald-400">
                    Visits <ArrowUpDown className="h-3 w-3" />
                  </Link>
                </TableHead>
                <TableHead className="w-[15%] text-foreground font-bold text-right">
                  <Link href={getSortLink("last_visit")} className="flex items-center justify-end gap-1 hover:text-emerald-400">
                    Last Visit <ArrowUpDown className="h-3 w-3" />
                  </Link>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {patients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-zinc-900/30 transition-colors">
                  <TableCell className="font-bold py-3 text-sm">
                    <Link href={`/patients/${patient.id}`} className="text-foreground hover:text-primary hover:underline flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center border border-border">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      {patient.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs py-3">
                    {patient.age ? `${patient.age}y` : "—"} / {patient.sex || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs py-3">
                    {patient.contactNo || "—"}
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs text-foreground py-3">
                    {patient.visitsCount}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs py-3">
                    {patient.lastVisit ? (
                      <span className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {format(new Date(patient.lastVisit), "dd MMM yyyy")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
