"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Plus,
  LogOut
} from "lucide-react"

interface NavigationProps {
  user: {
    name: string
    email: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/visits", label: "Visits Log", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-950/60 bg-zinc-950/80 backdrop-blur-md hidden md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-emerald-400">
              <span className="text-xl">🍃</span> VedicPotions Portal
            </Link>

            {/* Links */}
            <nav className="flex items-center gap-6">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive ? "text-emerald-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* User display */}
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-300">{user.name}</p>
              <p className="text-[10px] text-zinc-500">{user.email}</p>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 font-semibold cursor-pointer py-1.5 px-3 rounded-md hover:bg-zinc-900 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-950/60 bg-zinc-950/90 backdrop-blur-lg px-4 py-2 flex items-center justify-around md:hidden">
        {/* Left Side Links */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            pathname === "/dashboard" ? "text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/patients"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith("/patients") && !pathname.includes("/new")
              ? "text-emerald-400 font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Patients</span>
        </Link>

        {/* Center Prominent New Visit Shortcut */}
        <div className="relative -top-4">
          <Link
            href="/visits/new"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 shadow-lg border-4 border-zinc-950 hover:scale-105 transition-transform"
          >
            <Plus className="h-6 w-6 font-bold" />
          </Link>
        </div>

        {/* Right Side Links */}
        <Link
          href="/visits"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith("/visits") && pathname !== "/visits/new"
              ? "text-emerald-400 font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span>Logs</span>
        </Link>

        <Link
          href="/settings"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith("/settings") ? "text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </>
  )
}
