"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser, removeMember } from "@/app/actions/user-mgmt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, UserMinus, Loader2, Send } from "lucide-react"

interface Member {
  id: string
  role: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface MemberManagementPanelProps {
  members: Member[]
  invitations: any[]
  currentUserId: string
}

export function MemberManagementPanel({
  members,
  currentUserId,
}: MemberManagementPanelProps) {
  const router = useRouter()
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("doctor")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const res = await createUser({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole.toUpperCase() as "ADMIN" | "DOCTOR",
      })

      if (res.success) {
        setInviteSuccess(`Account registered for ${inviteName}! Initial password set to 'doctor123'.`)
        setInviteName("")
        setInviteEmail("")
        router.refresh()
      } else {
        setInviteError(res.error || "Failed to create clinician account.")
      }
    } catch (err: any) {
      setInviteError(err.message || "Failed to create clinician account.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to delete this clinician user account?")) return
    setDeactivatingId(memberId)

    try {
      const res = await removeMember(memberId)
      if (res.success) {
        router.refresh()
      } else {
        alert("Failed to remove user account.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove user account.")
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-primary" /> Register Clinician Account
          </h3>
          <p className="text-xs text-muted-foreground">Directly register a new clinician login credential in the practice database.</p>
        </div>

        {inviteSuccess && (
          <div className="p-3 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-md">
            ✅ {inviteSuccess}
          </div>
        )}
        {inviteError && (
          <div className="p-3 text-xs bg-destructive/15 border border-destructive/30 text-destructive rounded-md">
            ⚠️ {inviteError}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 w-full">
            <Label htmlFor="inviteName">Full Name</Label>
            <Input
              id="inviteName"
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Dr. Wife Name"
              className="bg-background border-border text-foreground h-9"
            />
          </div>

          <div className="space-y-1.5 w-full">
            <Label htmlFor="inviteEmail">Email Address</Label>
            <Input
              id="inviteEmail"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="doctor@practice.com"
              className="bg-background border-border text-foreground h-9"
            />
          </div>

          <div className="space-y-1.5 w-full flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <Label htmlFor="inviteRole">Role</Label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="doctor">DOCTOR</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isInviting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer h-9 px-4"
            >
              {isInviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Create
            </Button>
          </div>
        </form>
      </div>

      {/* Active members list */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden text-xs">
        <div className="p-5 border-b border-border/80 bg-zinc-900/30">
          <h3 className="font-bold text-foreground text-sm">Active Clinicians</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">List of clinician accounts active in the system.</p>
        </div>

        <Table>
          <TableHeader className="bg-zinc-900/10 border-b border-border/60">
            <TableRow>
              <TableHead className="text-foreground font-bold">Name</TableHead>
              <TableHead className="text-foreground font-bold">Email</TableHead>
              <TableHead className="text-foreground font-bold">Role</TableHead>
              <TableHead className="text-foreground font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-zinc-900/10 transition-colors">
                <TableCell className="font-bold text-foreground py-3">{member.user.name}</TableCell>
                <TableCell className="text-muted-foreground py-3">{member.user.email}</TableCell>
                <TableCell className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    member.role === "admin"
                      ? "bg-primary/15 text-primary"
                      : "bg-teal-500/15 text-teal-400"
                  }`}>
                    {member.role.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right py-3">
                  {member.userId !== currentUserId ? (
                    <Button
                      onClick={() => handleRemove(member.id)}
                      disabled={deactivatingId === member.id}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1.5 cursor-pointer text-[10px] h-8 ml-auto"
                    >
                      {deactivatingId === member.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserMinus className="h-3 w-3" />
                      )}
                      Remove
                    </Button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic font-semibold pr-2">Current User</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
