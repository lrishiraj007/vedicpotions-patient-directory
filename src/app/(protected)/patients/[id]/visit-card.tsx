"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { updateVisit, deleteVisit } from "@/app/actions/visit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, MapPin, IndianRupee, Edit2, Trash2, Calendar, Save, Loader2 } from "lucide-react"

const visitFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  symptoms: z.string().nullable().optional(),
  history: z.string().nullable().optional(),
  examination: z.string().nullable().optional(),
  investigations: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  treatmentAdvised: z.string().nullable().optional(),
  paymentAmount: z.string().transform(val => val === '' ? null : parseInt(val, 10)).pipe(z.number().nullable()).optional(),
  paymentMethod: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

interface VisitCardProps {
  visit: {
    id: string
    patientId: string
    date: Date
    location: string
    symptoms: string | null
    history: string | null
    examination: string | null
    investigations: string | null
    diagnosis: string | null
    treatmentAdvised: string | null
    paymentAmount: number | null
    paymentMethod: string | null
    notes: string | null
  }
  isAdmin: boolean
}

export function VisitCard({ visit, isAdmin }: VisitCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: format(new Date(visit.date), 'yyyy-MM-dd'),
      location: visit.location,
      symptoms: visit.symptoms || "",
      history: visit.history || "",
      examination: visit.examination || "",
      investigations: visit.investigations || "",
      diagnosis: visit.diagnosis || "",
      treatmentAdvised: visit.treatmentAdvised || "",
      paymentAmount: visit.paymentAmount !== null ? String(visit.paymentAmount) : "",
      paymentMethod: visit.paymentMethod || "Not Paid",
      notes: visit.notes || "",
    },
  })

  const onSubmit = async (values: z.output<typeof visitFormSchema>) => {
    setErrorMsg(null)
    try {
      const result = await updateVisit(visit.id, {
        patientId: visit.patientId,
        date: new Date(values.date),
        location: values.location,
        symptoms: values.symptoms || null,
        history: values.history || null,
        examination: values.examination || null,
        investigations: values.investigations || null,
        diagnosis: values.diagnosis || null,
        treatmentAdvised: values.treatmentAdvised || null,
        paymentAmount: values.paymentAmount,
        paymentMethod: values.paymentMethod || null,
        notes: values.notes || null,
      })

      if (result.success) {
        setEditOpen(false)
        router.refresh()
      } else {
        setErrorMsg("Failed to update visit entry.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update visit entry.")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteVisit(visit.id)
      if (result.success) {
        setDeleteOpen(false)
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete visit entry.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all">
      {/* Accordion Trigger Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 transition-colors text-xs select-none"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-primary" />
          <div>
            <h4 className="font-bold text-foreground">{format(new Date(visit.date), 'dd MMM yyyy')}</h4>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-primary" /> {visit.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            {visit.paymentAmount !== null && (
              <p className="font-semibold text-foreground flex items-center justify-end gap-0.5">
                <IndianRupee className="h-3 w-3 text-muted-foreground" /> {visit.paymentAmount}
              </p>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 inline-block ${
              visit.paymentMethod === 'Not Paid' || visit.paymentMethod === 'Unpaid'
                ? 'bg-destructive/15 text-destructive'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {visit.paymentMethod || 'Not Paid'}
            </span>
          </div>

          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>
      </div>

      {/* Collapsible Panel Content */}
      {expanded && (
        <div className="border-t border-border/60 bg-zinc-950/20 p-5 space-y-5 text-xs">
          {/* Clinical logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symptoms */}
            {visit.symptoms && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Symptoms / Chief Complaint</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{visit.symptoms}</p>
              </div>
            )}
            {/* History */}
            {visit.history && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Medical History</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{visit.history}</p>
              </div>
            )}
            {/* Examination */}
            {visit.examination && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Examination (O/E)</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{visit.examination}</p>
              </div>
            )}
            {/* Investigations */}
            {visit.investigations && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Investigations Done / Advised</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{visit.investigations}</p>
              </div>
            )}
            {/* Diagnosis */}
            {visit.diagnosis && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Diagnosis</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-semibold">{visit.diagnosis}</p>
              </div>
            )}
            {/* Treatment */}
            {visit.treatmentAdvised && (
              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Treatment Advised</h5>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-semibold">{visit.treatmentAdvised}</p>
              </div>
            )}
          </div>

          {/* General Notes */}
          {visit.notes && (
            <div className="space-y-1 bg-zinc-900/20 p-3 border border-border/30 rounded-lg">
              <h5 className="font-bold text-[10px] uppercase text-zinc-500 tracking-wider">Visit Notes / Details</h5>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}

          {/* Action triggers */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            {/* Edit Trigger */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="flex items-center gap-1 cursor-pointer text-[10px] h-8">
                    <Edit2 className="h-3 w-3" /> Edit Log
                  </Button>
                }
              />
              <DialogContent className="max-w-2xl bg-card border-border overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Edit Visit Log</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs">
                    Update the clinical entries and invoice details for this visit.
                  </DialogDescription>
                </DialogHeader>

                {errorMsg && (
                  <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-date">Date</Label>
                      <Input id="edit-date" type="date" required {...register("date")} className="bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input id="edit-location" required {...register("location")} className="bg-background border-border text-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-symptoms">Symptoms</Label>
                      <textarea id="edit-symptoms" rows={2} {...register("symptoms")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-history">History</Label>
                      <textarea id="edit-history" rows={2} {...register("history")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-examination">Examination (O/E)</Label>
                      <textarea id="edit-examination" rows={2} {...register("examination")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-investigations">Investigations</Label>
                      <textarea id="edit-investigations" rows={2} {...register("investigations")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-diagnosis">Diagnosis</Label>
                      <textarea id="edit-diagnosis" rows={2} {...register("diagnosis")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-treatment">Treatment Advised</Label>
                      <textarea id="edit-treatment" rows={2} {...register("treatmentAdvised")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-payment">Payment Amount</Label>
                      <Input id="edit-payment" type="number" {...register("paymentAmount")} className="bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-method">Payment Method</Label>
                      <select id="edit-method" {...register("paymentMethod")} className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="Not Paid">Not Paid</option>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-notes">General Notes</Label>
                    <textarea id="edit-notes" rows={2} {...register("notes")} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {isSubmitting ? "Updating..." : "Update Visit"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Trigger (ADMIN Only) */}
            {isAdmin && (
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm" variant="destructive" className="flex items-center gap-1 cursor-pointer text-[10px] h-8">
                      <Trash2 className="h-3 w-3" /> Delete Entry
                    </Button>
                  }
                />
                <DialogContent className="max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Delete Visit Entry</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                      Are you sure you want to delete this clinical visit log? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2 justify-end pt-2">
                    <Button onClick={() => setDeleteOpen(false)} size="sm" variant="outline" className="cursor-pointer text-xs">
                      Cancel
                    </Button>
                    <Button onClick={handleDelete} disabled={isDeleting} size="sm" variant="destructive" className="flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50">
                      {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Yes, Delete visit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
