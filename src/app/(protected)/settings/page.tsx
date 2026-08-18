import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { ChangePasswordForm } from "./change-password-form"
import { MemberManagementPanel } from "./member-management-panel"
import { Shield, Settings, User } from "lucide-react"

export default async function SettingsPage() {
  const session = await getAuthSession()
  if (!session) return null

  // Fetch all user accounts and map to Member shape for reuse
  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const members = users.map((u) => ({
    id: u.id,
    userId: u.id,
    role: u.role.toLowerCase(), // "admin" | "doctor"
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
    },
  }))

  return (
    <div className="space-y-6 pb-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage clinical profiles, team permissions, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal info & password */}
        <div className="md:col-span-1 space-y-6">
          {/* Personal Info Profile */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" /> Profile Details
            </h3>
            <div className="space-y-2 pt-1.5">
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Clinician Name</p>
                <p className="font-bold text-foreground text-xs mt-0.5">{session.user.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Email Address</p>
                <p className="text-zinc-300 text-xs mt-0.5">{session.user.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Role Scope</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 bg-primary/10 text-primary">
                  {session.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <ChangePasswordForm />
        </div>

        {/* Right Column: User management (ADMIN Only) */}
        <div className="md:col-span-2 space-y-6">
          {session.isAdmin ? (
            <MemberManagementPanel
              members={members}
              invitations={[]}
              currentUserId={session.user.id}
            />
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4 text-xs">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-border">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">User Management Restricted</h4>
                <p className="text-muted-foreground text-[10px] mt-0.5">
                  Only administrators (ADMIN role) can create clinician accounts or delete members.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
