"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { searchPatients, createPatient } from '@/app/actions/patient'
import { createVisit } from '@/app/actions/visit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, User, ChevronRight, Loader2, Save } from 'lucide-react'

const newVisitSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  symptoms: z.string().optional(),
  history: z.string().optional(),
  examination: z.string().optional(),
  investigations: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentAdvised: z.string().optional(),
  paymentAmount: z.string().transform(val => val === '' ? null : parseInt(val, 10)).pipe(z.number().nullable()).optional(),
  paymentMethod: z.string().default('Not Paid'),
  notes: z.string().optional(),
})

const inlinePatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().transform(val => val === '' ? null : parseInt(val, 10)).pipe(z.number().nullable()).optional(),
  sex: z.string().default(''),
  contactNo: z.string().optional(),
  notes: z.string().optional(),
})

interface SelectedPatient {
  id: string
  name: string
  age: number | null
  sex: string | null
  contactNo: string | null
}

interface NewVisitFormProps {
  initialPatient: SelectedPatient | null
}

export function NewVisitForm({ initialPatient }: NewVisitFormProps) {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(initialPatient)
  
  // Patient Autocomplete State
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [patientResults, setPatientResults] = useState<SelectedPatient[]>([])
  const [isSearchingPatients, setIsSearchingPatients] = useState(false)
  const [showResultsDropdown, setShowResultsDropdown] = useState(false)

  // Inline Patient Dialog State
  const [createPatientOpen, setCreatePatientOpen] = useState(false)
  const [patientError, setPatientError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // React Hook Form for Visit details
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(newVisitSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      location: '',
      symptoms: '',
      history: '',
      examination: '',
      investigations: '',
      diagnosis: '',
      treatmentAdvised: '',
      paymentAmount: '',
      paymentMethod: 'Not Paid',
      notes: '',
    },
  })

  const selectedLocation = watch('location')

  // React Hook Form for Inline Patient Registration
  const {
    register: registerPatient,
    handleSubmit: handlePatientSubmit,
    reset: resetPatientForm,
    formState: { errors: patientFormErrors },
  } = useForm<any>({
    resolver: zodResolver(inlinePatientSchema),
    defaultValues: {
      name: '',
      age: '',
      sex: '',
      contactNo: '',
      notes: '',
    },
  })

  // Debounced Patient Search matching name or contact number
  useEffect(() => {
    if (patientSearchQuery.trim() === '') {
      setPatientResults([])
      return
    }

    const searchTimer = setTimeout(async () => {
      setIsSearchingPatients(true)
      try {
        const results = await searchPatients(patientSearchQuery)
        setPatientResults(results)
      } catch (e) {
        console.error(e)
      } finally {
        setIsSearchingPatients(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [patientSearchQuery])

  // Quick Location buttons select
  const setQuickLocation = (loc: string) => {
    setValue('location', loc)
  }

  // Handle visit form submission
  const onSubmitVisit = async (values: z.output<typeof newVisitSchema>) => {
    if (!selectedPatient) {
      setFormError('Please select or create a patient first.')
      return
    }

    setFormError(null)
    try {
      const result = await createVisit({
        patientId: selectedPatient.id,
        date: new Date(values.date),
        location: values.location,
        symptoms: values.symptoms || null,
        history: values.history || null,
        examination: values.examination || null,
        investigations: values.investigations || null,
        diagnosis: values.diagnosis || null,
        treatmentAdvised: values.treatmentAdvised || null,
        paymentAmount: values.paymentAmount,
        paymentMethod: values.paymentMethod,
        notes: values.notes || null,
      })

      if (result.visit) {
        router.push(`/patients/${selectedPatient.id}`)
        router.refresh()
      } else {
        setFormError('Failed to create visit.')
      }
    } catch (e) {
      setFormError('Failed to create visit. Please check parameters.')
    }
  }

  // Handle inline patient registration submit
  const onSubmitPatient = async (values: z.output<typeof inlinePatientSchema>) => {
    setPatientError(null)
    try {
      const result = await createPatient({
        name: values.name,
        age: values.age,
        sex: values.sex || null,
        contactNo: values.contactNo || null,
        notes: values.notes || null,
      })
      if (result.patient) {
        setSelectedPatient(result.patient)
        setCreatePatientOpen(false)
        resetPatientForm()
        setPatientSearchQuery('')
      } else {
        setPatientError('Failed to register patient.')
      }
    } catch (e) {
      setPatientError('Failed to register patient.')
    }
  }

  return (
    <div className="space-y-6">
      {formError && (
        <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
          ⚠️ {formError}
        </div>
      )}

      {/* STEP 1: Select or Create Patient Scope */}
      <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-foreground text-sm">1. Patient Scopes</h3>
          <p className="text-xs text-muted-foreground">Select an existing clinical entry or register a new one inline.</p>
        </div>

        {selectedPatient ? (
          /* Selected patient display */
          <div className="flex items-center justify-between bg-zinc-900/40 border border-border/60 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center border border-border">
                <User className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-foreground">{selectedPatient.name}</h4>
                <p className="text-muted-foreground text-[10px] mt-0.5">
                  {selectedPatient.age ? `${selectedPatient.age}y` : '—'} / {selectedPatient.sex || '—'} • {selectedPatient.contactNo || 'No Contact'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPatient(null)
                setPatientSearchQuery('')
              }}
              className="text-[10px] font-semibold text-zinc-400 hover:text-red-400 cursor-pointer h-8"
            >
              Change Patient
            </Button>
          </div>
        ) : (
          /* Autocomplete search field */
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search patient by name or contact number..."
                value={patientSearchQuery}
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value)
                  setShowResultsDropdown(true)
                }}
                className="pl-9 bg-background border-border text-foreground h-10 text-xs w-full"
              />
              {isSearchingPatients && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Dropdown Options List */}
            {showResultsDropdown && patientSearchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-border rounded-md shadow-xl z-50 divide-y divide-border/60 max-h-60 overflow-y-auto">
                {patientResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground space-y-2">
                    <p>No patients match this search query.</p>
                    
                    {/* Inline Create Patient button */}
                    <Dialog open={createPatientOpen} onOpenChange={setCreatePatientOpen}>
                      <DialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCreatePatientOpen(true)}
                            className="mt-1 flex items-center gap-1 mx-auto cursor-pointer text-[10px] h-8"
                          >
                            <Plus className="h-3.5 w-3.5" /> Create "{patientSearchQuery}" as Patient
                          </Button>
                        }
                      />
                      <DialogContent className="bg-card border-border max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Register New Patient</DialogTitle>
                          <DialogDescription className="text-muted-foreground text-xs font-semibold">
                            Enter details to register the new patient.
                          </DialogDescription>
                        </DialogHeader>

                        {patientError && (
                          <div className="p-2.5 text-[10px] bg-destructive/15 border border-destructive/30 text-destructive rounded">
                            ⚠️ {patientError}
                          </div>
                        )}

                        <form onSubmit={handlePatientSubmit(onSubmitPatient)} className="space-y-4 text-xs">
                          <div className="space-y-1.5">
                            <Label htmlFor="new-name">Full Name</Label>
                            <Input
                              id="new-name"
                              required
                              {...registerPatient('name')}
                              className="bg-background border-border text-foreground h-9"
                            />
                            {patientFormErrors.name?.message && (
                              <p className="text-[10px] text-destructive">{String(patientFormErrors.name.message)}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="new-age">Age</Label>
                              <Input
                                id="new-age"
                                type="number"
                                {...registerPatient('age')}
                                className="bg-background border-border text-foreground h-9"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="new-sex">Sex</Label>
                              <select
                                id="new-sex"
                                {...registerPatient('sex')}
                                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="new-contact">Contact Number</Label>
                            <Input
                              id="new-contact"
                              {...registerPatient('contactNo')}
                              className="bg-background border-border text-foreground h-9"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="new-notes">Clinical Notes</Label>
                            <textarea
                              id="new-notes"
                              rows={2}
                              {...registerPatient('notes')}
                              className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <DialogFooter>
                            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold cursor-pointer text-xs h-9">
                              Save & Select Patient
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  patientResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setShowResultsDropdown(false)
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-zinc-950 text-left transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {patient.age ? `${patient.age}y` : '—'} / {patient.sex || '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-primary">
                        Select <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* STEP 2: Visit & Clinical details */}
      <form onSubmit={handleSubmit(onSubmitVisit)} className="space-y-6">
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-foreground text-sm">2. Visit details</h3>
            <p className="text-xs text-muted-foreground">Log clinical observations, diagnostics, and invoice options.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  {...register('date')}
                  className="bg-background border-border text-foreground h-9"
                />
                {errors.date?.message && <p className="text-xs text-destructive">{String(errors.date.message)}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs text-muted-foreground">Location</Label>
                <Input
                  id="location"
                  required
                  placeholder="Enter location (e.g. Andheri)"
                  {...register('location')}
                  className="bg-background border-border text-foreground h-9"
                />
                {errors.location?.message && <p className="text-xs text-destructive">{String(errors.location.message)}</p>}
                
                {/* Quick select tags */}
                <div className="flex gap-1.5 pt-1.5 flex-wrap">
                  {['Andheri', 'Naigaon', 'Teleconsult'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setQuickLocation(loc)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        selectedLocation === loc
                          ? 'bg-primary text-primary-foreground border-primary/20 font-bold'
                          : 'bg-zinc-900 border-border/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Symptoms */}
              <div className="space-y-1.5">
                <Label htmlFor="symptoms">Symptoms / Chief Complaint</Label>
                <textarea
                  id="symptoms"
                  rows={3}
                  {...register('symptoms')}
                  placeholder="Enter patient complaints, pain thresholds, duration, etc."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* History */}
              <div className="space-y-1.5">
                <Label htmlFor="history">Medical History</Label>
                <textarea
                  id="history"
                  rows={3}
                  {...register('history')}
                  placeholder="Past illnesses, family history, lifestyle choices, etc."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Examination */}
              <div className="space-y-1.5">
                <Label htmlFor="examination">Examination (O/E)</Label>
                <textarea
                  id="examination"
                  rows={3}
                  {...register('examination')}
                  placeholder="Pulse, blood pressure, tongue, general physical parameters..."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Investigations */}
              <div className="space-y-1.5">
                <Label htmlFor="investigations">Investigations Done / Advised</Label>
                <textarea
                  id="investigations"
                  rows={3}
                  {...register('investigations')}
                  placeholder="Lab parameters, X-Ray, reports, recommended scans..."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diagnosis */}
              <div className="space-y-1.5">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <textarea
                  id="diagnosis"
                  rows={3}
                  {...register('diagnosis')}
                  placeholder="Final diagnostics, syndromic assessments..."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                />
              </div>

              {/* Treatment */}
              <div className="space-y-1.5">
                <Label htmlFor="treatment">Treatment Advised</Label>
                <textarea
                  id="treatment"
                  rows={3}
                  {...register('treatmentAdvised')}
                  placeholder="Ayurvedic formulations, diet sheets, purificatory routines..."
                  className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="Fee amount in INR"
                  {...register('paymentAmount')}
                  className="bg-background border-border text-foreground h-9"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  {...register('paymentMethod')}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Not Paid">Not Paid</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">General Visit Notes</Label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                placeholder="Clinic logs, follow-up timelines, specific parameters..."
                className="w-full min-h-16 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 py-2.5"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSubmitting ? 'Saving Visit Entry...' : 'Save Visit Record'}
        </Button>
      </form>
    </div>
  )
}
