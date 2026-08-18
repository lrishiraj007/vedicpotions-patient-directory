"use client"

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateVisit, deleteVisit } from '@/app/actions/visit'
import { ChevronDown, ChevronUp, MapPin, IndianRupee, Edit2, Trash2, Calendar, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const editVisitSchema = z.object({
  date: z.string().transform(val => new Date(val)),
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

interface VisitWithPatient {
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
  patient: {
    id: string
    name: string
  }
}

interface VisitsLogProps {
  visits: VisitWithPatient[]
  isAdmin: boolean
}

export function VisitsLog({ visits, isAdmin }: VisitsLogProps) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [editingVisit, setEditingVisit] = useState<VisitWithPatient | null>(null)
  
  // Delete Dialog State
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // React Hook Form for Edit Dialog
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(editVisitSchema),
  })

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const startEdit = (visit: VisitWithPatient) => {
    reset({
      date: format(new Date(visit.date), 'yyyy-MM-dd'),
      location: visit.location,
      symptoms: visit.symptoms || '',
      history: visit.history || '',
      examination: visit.examination || '',
      investigations: visit.investigations || '',
      diagnosis: visit.diagnosis || '',
      treatmentAdvised: visit.treatmentAdvised || '',
      paymentAmount: visit.paymentAmount !== null ? String(visit.paymentAmount) : '',
      paymentMethod: visit.paymentMethod || 'Not Paid',
      notes: visit.notes || '',
    })
    setEditingVisit(visit)
  }

  const onEditSubmit = async (values: z.output<typeof editVisitSchema>) => {
    if (!editingVisit) return
    try {
      const result = await updateVisit(editingVisit.id, {
        patientId: editingVisit.patientId,
        date: values.date,
        location: values.location,
        symptoms: values.symptoms,
        history: values.history,
        examination: values.examination,
        investigations: values.investigations,
        diagnosis: values.diagnosis,
        treatmentAdvised: values.treatmentAdvised,
        paymentAmount: values.paymentAmount,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      })
      
      if (result.success) {
        setEditingVisit(null)
        router.refresh()
      } else {
        alert('Failed to update visit.')
      }
    } catch (e) {
      alert('An error occurred while updating the visit.')
    }
  }

  const handleDelete = async () => {
    if (!deletingVisitId) return
    setIsDeleting(true)
    try {
      const result = await deleteVisit(deletingVisitId)
      if (result.success) {
        setDeletingVisitId(null)
        router.refresh()
      } else {
        alert('Failed to delete visit.')
      }
    } catch (e) {
      alert('An error occurred while deleting the visit.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {visits.length === 0 ? (
        <div className="p-16 text-center text-sm text-muted-foreground italic">
          No visits logged matching current filters.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-zinc-900/40 border-b border-border/80">
            <TableRow>
              <TableHead className="w-[5%]"></TableHead>
              <TableHead className="w-[30%] text-foreground font-bold">Patient Name</TableHead>
              <TableHead className="w-[20%] text-foreground font-bold">Date</TableHead>
              <TableHead className="w-[20%] text-foreground font-bold">Location</TableHead>
              <TableHead className="w-[25%] text-foreground font-bold text-right">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {visits.map((visit) => {
              const isExpanded = !!expandedRows[visit.id]
              return (
                <Fragment key={visit.id}>
                  <TableRow
                    key={visit.id}
                    onClick={() => toggleRow(visit.id)}
                    className="hover:bg-zinc-900/30 transition-colors cursor-pointer select-none"
                  >
                    <TableCell className="py-3">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </TableCell>
                    <TableCell className="font-bold text-foreground text-sm py-3">
                      <Link
                        href={`/patients/${visit.patient.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary hover:underline"
                      >
                        {visit.patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {format(new Date(visit.date), 'dd MMM yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        {visit.location}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3 text-xs">
                      {visit.paymentAmount !== null && (
                        <span className="font-semibold text-foreground mr-2">₹{visit.paymentAmount}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${
                        visit.paymentMethod === 'Not Paid' || visit.paymentMethod === 'Unpaid'
                          ? 'bg-destructive/15 text-destructive'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {visit.paymentMethod || 'Not Paid'}
                      </span>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-zinc-950/25 hover:bg-zinc-950/25">
                      <TableCell colSpan={5} className="p-5">
                        <div className="space-y-4 text-xs">
                          {/* Clinical grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visit.symptoms && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Symptoms / Chief Complaint</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{visit.symptoms}</p>
                              </div>
                            )}
                            {visit.history && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">History</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{visit.history}</p>
                              </div>
                            )}
                            {visit.examination && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Examination (O/E)</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{visit.examination}</p>
                              </div>
                            )}
                            {visit.investigations && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Investigations</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{visit.investigations}</p>
                              </div>
                            )}
                            {visit.diagnosis && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Diagnosis</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap font-semibold leading-relaxed">{visit.diagnosis}</p>
                              </div>
                            )}
                            {visit.treatmentAdvised && (
                              <div className="space-y-1 bg-zinc-900/40 p-3 border border-border/40 rounded-lg">
                                <h5 className="font-bold text-[10px] uppercase text-primary tracking-wider">Treatment Advised</h5>
                                <p className="text-zinc-300 whitespace-pre-wrap font-semibold leading-relaxed">{visit.treatmentAdvised}</p>
                              </div>
                            )}
                          </div>

                          {visit.notes && (
                            <div className="bg-zinc-900/20 p-3 border border-border/30 rounded-lg space-y-1">
                              <h5 className="font-bold text-[10px] uppercase text-zinc-500 tracking-wider">Visit Notes</h5>
                              <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">{visit.notes}</p>
                            </div>
                          )}

                          {/* Quick row actions */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(visit)
                              }}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 cursor-pointer text-[10px] h-8"
                            >
                              <Edit2 className="h-3 w-3" /> Edit Log
                            </Button>

                            {isAdmin && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingVisitId(visit.id)
                                }}
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-1 cursor-pointer text-[10px] h-8"
                              >
                                <Trash2 className="h-3 w-3" /> Delete Entry
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Inline Quick Edit Dialog */}
      <Dialog open={!!editingVisit} onOpenChange={(open) => !open && setEditingVisit(null)}>
        <DialogContent className="max-w-2xl bg-card border-border overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Visit Log</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Update the clinical entries and invoice details for this visit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-date">Date</Label>
                <Input id="log-date" type="date" required {...register('date')} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-location">Location</Label>
                <Input id="log-location" required {...register('location')} className="bg-background border-border text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-symptoms">Symptoms</Label>
                <textarea id="log-symptoms" rows={2} {...register('symptoms')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-history">History</Label>
                <textarea id="log-history" rows={2} {...register('history')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-examination">Examination (O/E)</Label>
                <textarea id="log-examination" rows={2} {...register('examination')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-investigations">Investigations</Label>
                <textarea id="log-investigations" rows={2} {...register('investigations')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-diagnosis">Diagnosis</Label>
                <textarea id="log-diagnosis" rows={2} {...register('diagnosis')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-treatment">Treatment Advised</Label>
                <textarea id="log-treatment" rows={2} {...register('treatmentAdvised')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-payment">Payment Amount</Label>
                <Input id="log-payment" type="number" {...register('paymentAmount')} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="log-method">Payment Method</Label>
                <select id="log-method" {...register('paymentMethod')} className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="Not Paid">Not Paid</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="log-notes">General Notes</Label>
              <textarea id="log-notes" rows={2} {...register('notes')} className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingVisitId} onOpenChange={(open) => !open && setDeletingVisitId(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Visit Entry</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Are you sure you want to delete this clinical visit entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button onClick={() => setDeletingVisitId(null)} size="sm" variant="outline" className="cursor-pointer text-xs">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} size="sm" variant="destructive" className="flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50">
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Yes, Delete visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
