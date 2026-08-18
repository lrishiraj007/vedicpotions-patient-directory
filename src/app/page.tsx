"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, ShieldAlert, CheckCircle2 } from "lucide-react"

export default function AuthPortal() {
  const router = useRouter()
  const { data: sessionInfo, isPending: sessionPending } = useSession()

  // Auth Tab State
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin")

  // Form Field States
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  // Form Status States
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect instantly to clinical portal if session exists
  useEffect(() => {
    if (sessionInfo?.user) {
      router.push("/dashboard")
    }
  }, [sessionInfo, router])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (authTab === "signup") {
        const res = await signUp.email({
          email,
          password,
          name,
        })
        if (res.error) {
          setErrorMsg(res.error.message || "Registration failed. Please check parameters.")
        } else {
          setSuccessMsg("Account registered successfully! You can now log in.")
          setAuthTab("signin")
          setEmail("")
          setPassword("")
          setName("")
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        })
        if (res.error) {
          setErrorMsg(res.error.message || "Invalid email address or password.")
        } else {
          setSuccessMsg("Successfully authenticated! Launching dashboard...")
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // Render Loader if Session is Loading or Redirecting
  if (sessionPending || sessionInfo?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 animate-ping rounded-full bg-emerald-500/10 opacity-75"></div>
            <div className="relative h-14 w-14 rounded-full border border-emerald-950 bg-zinc-900 flex items-center justify-center shadow-2xl">
              <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground animate-pulse font-medium">Launching secure clinical portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial highlight glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-6 relative z-10">
        
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <span className="text-4xl inline-block animate-bounce duration-[3000ms]">🍃</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400">VedicPotions Portal</h1>
          <p className="text-zinc-500 text-xs">Ayurvedic Practice Patient Directory</p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 text-xs bg-red-950/40 border border-red-800/40 text-red-300 rounded-lg flex items-start gap-2 animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-zinc-800/60">
          <button
            onClick={() => {
              setAuthTab("signin")
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 pb-3 text-xs font-semibold transition-colors border-b-2 ${
              authTab === "signin" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthTab("signup")
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 pb-3 text-xs font-semibold transition-colors border-b-2 ${
              authTab === "signup" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Forms */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {authTab === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="bg-zinc-950/50 border-border text-foreground h-10 pl-9 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@practice.com"
                className="bg-zinc-950/50 border-border text-foreground h-10 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-zinc-950/50 border-border text-foreground h-10 pl-9 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold rounded-md transition-all text-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5 cursor-pointer h-10 active:scale-[0.99]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : authTab === "signup" ? "Register Account" : "Access Portal"}
          </Button>
        </form>
      </div>
    </div>
  )
}
