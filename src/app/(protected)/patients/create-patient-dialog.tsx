"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPatient } from "@/app/actions/patient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().transform(val => val === '' ? null : parseInt(val, 10)).pipe(z.number().nullable()).optional(),
  sex: z.string().default(""),
  contactNo: z.string().optional(),
  notes: z.string().optional(),
})

export function CreatePatientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: "",
      sex: "",
      contactNo: "",
      notes: "",
    },
  })

  const onSubmit = async (values: z.output<typeof schema>) => {
    setErrorMsg(null)
    try {
      const result = await createPatient({
        name: values.name,
        age: values.age,
        sex: values.sex || null,
        contactNo: values.contactNo || null,
        notes: values.notes || null,
      })

      if (result.success) {
        setOpen(false)
        reset()
        router.refresh()
      } else {
        setErrorMsg("Failed to register patient record.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register patient record.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
            <Plus className="h-4 w-4" /> Register Patient
          </Button>
        }
      />
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Register New Patient</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Create a new patient entry in the clinic database.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              {...register("name")}
              placeholder="Enter patient full name"
              className="bg-background border-border text-foreground"
            />
            {errors.name?.message && (
              <p className="text-[10px] text-destructive">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register("age")}
                placeholder="Age in years"
                className="bg-background border-border text-foreground"
              />
              {errors.age?.message && (
                <p className="text-[10px] text-destructive">{String(errors.age.message)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sex">Sex</Label>
              <select
                id="sex"
                {...register("sex")}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactNo">Contact Number</Label>
            <Input
              id="contactNo"
              {...register("contactNo")}
              placeholder="e.g. +91 9876543210"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Clinical Notes</Label>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              placeholder="Add patient background notes, chronic conditions, etc."
              className="w-full min-h-20 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
