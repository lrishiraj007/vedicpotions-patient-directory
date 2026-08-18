import { auth } from "./auth"
import { headers } from "next/headers"

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) return null

  const role = (session.user as any).role || "DOCTOR"
  const isAdmin = role === "ADMIN"

  return {
    user: session.user,
    session: session.session,
    role,
    isAdmin,
  }
}
