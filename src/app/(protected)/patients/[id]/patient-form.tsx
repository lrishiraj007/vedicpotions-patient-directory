"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updatePatient, deletePatient } from "@/app/actions/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Save, X, Loader2, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const patientFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().transform(val => val === '' ? null : parseInt(val, 10)).pipe(z.number().nullable()).optional(),
  sex: z.string().nullable().optional(),
  contactNo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

interface PatientFormProps {
  patient: {
    id: string
    name: string
    age: number | null
    sex: string | null
    contactNo: string | null
    notes: string | null
  }
  isAdmin: boolean
}

export function PatientForm({ patient, isAdmin }: PatientFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: patient.name,
      age: patient.age !== null ? String(patient.age) : "",
      sex: patient.sex || "",
      contactNo: patient.contactNo || "",
      notes: patient.notes || "",
    },
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    setErrorMsg(null)
    setDeleteDialogOpen(false)

    try {
      const res = await deletePatient(patient.id)
      if (res.success) {
        router.push("/patients")
        router.refresh()
      } else {
        setErrorMsg("Failed to delete patient record.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete patient record.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setErrorMsg(null)
  }

  const onSubmit = async (values: z.output<typeof patientFormSchema>) => {
    setErrorMsg(null)
    try {
      const result = await updatePatient(patient.id, {
        name: values.name,
        age: values.age,
        sex: values.sex || null,
        contactNo: values.contactNo || null,
        notes: values.notes || null,
      })

      if (result.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setErrorMsg("Failed to update patient details.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update patient details.")
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Patient Information</h2>
          <p className="text-xs text-muted-foreground">Clinician record and background details.</p>
        </div>
        {!isEditing ? (
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={() => {
                  setDeleteConfirmationInput("")
                  setDeleteDialogOpen(true)
                }}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1.5 cursor-pointer text-xs h-8 animate-pulse bg-red-950/60 hover:bg-red-800/80 border border-red-800/40 text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Patient
              </Button>
            )}
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 cursor-pointer text-xs h-8"
            >
              <Edit2 className="h-3 w-3" /> Edit Details
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 cursor-pointer text-xs"
            >
              <X className="h-3 w-3" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              disabled={!isEditing || isSubmitting}
              {...register('name')}
              className="bg-background border-border text-foreground"
            />
            {errors.name?.message && (
              <p className="text-[10px] text-destructive">{String(errors.name.message)}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              disabled={!isEditing || isSubmitting}
              {...register('age')}
              className="bg-background border-border text-foreground"
            />
            {errors.age?.message && (
              <p className="text-[10px] text-destructive">{String(errors.age.message)}</p>
            )}
          </div>

          {/* Sex */}
          <div className="space-y-1.5">
            <Label htmlFor="sex">Sex</Label>
            {isEditing ? (
              <select
                id="sex"
                disabled={isSubmitting}
                {...register('sex')}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <Input
                id="sex-read"
                disabled
                value={patient.sex || "—"}
                className="bg-background border-border text-foreground disabled:opacity-80"
              />
            )}
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="contactNo">Contact Number</Label>
            <Input
              id="contactNo"
              disabled={!isEditing || isSubmitting}
              {...register('contactNo')}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Clinical Background Notes</Label>
          <textarea
            id="notes"
            rows={3}
            disabled={!isEditing || isSubmitting}
            {...register('notes')}
            className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-80"
          />
        </div>

        {isEditing && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSubmitting ? "Saving..." : "Save Details"}
            </Button>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-100">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-sm font-bold text-red-400">Delete Patient Profile?</DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-400">
              This action is permanent. Deleting <span className="font-bold text-zinc-200">{patient.name}</span>'s record will irreversibly purge all clinical details and historical visits from the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete" className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Type <span className="font-bold text-red-400">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="bg-zinc-950 border-zinc-800 text-foreground placeholder:text-zinc-800 h-9 text-xs"
            />
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-zinc-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-9 px-4 text-xs font-semibold cursor-pointer bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteConfirmationInput !== "DELETE" || isDeleting}
              onClick={handleDelete}
              className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
