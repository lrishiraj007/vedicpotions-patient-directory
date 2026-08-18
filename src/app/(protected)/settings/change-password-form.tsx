"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function ChangePasswordForm() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setSuccessMsg(null)
    setErrorMsg(null)

    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    })

    if (error) {
      setErrorMsg(error.message || "Failed to change password. Make sure current password is correct.")
    } else {
      setSuccessMsg("Password changed successfully!")
      reset()
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 text-xs">
      <div>
        <h3 className="font-bold text-foreground text-sm">Security</h3>
        <p className="text-xs text-muted-foreground">Change your account password.</p>
      </div>

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-md">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            required
            {...register("currentPassword")}
            className="bg-background border-border text-foreground h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            required
            {...register("newPassword")}
            className="bg-background border-border text-foreground h-9"
          />
          {errors.newPassword?.message && (
            <p className="text-[10px] text-destructive">{String(errors.newPassword.message)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            {...register("confirmPassword")}
            className="bg-background border-border text-foreground h-9"
          />
          {errors.confirmPassword?.message && (
            <p className="text-[10px] text-destructive">{String(errors.confirmPassword.message)}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer h-9 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Update Password
        </Button>
      </form>
    </div>
  )
}
