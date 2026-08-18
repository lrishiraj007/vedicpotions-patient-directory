import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth-session"
import { Navigation } from "@/components/navigation"
import { PusherSync } from "@/components/pusher-sync"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  // Redirect to home if unauthenticated
  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      <PusherSync />
      <Navigation user={{ name: session.user.name, email: session.user.email }} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 md:px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
