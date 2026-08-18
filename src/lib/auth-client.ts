import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

// Export helper hooks and functions for components
export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient
