"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function VisitsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state initialized from URL params
  const [patientSearch, setPatientSearch] = useState(searchParams.get("patient") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get("payment") || "")
  const [fromDate, setFromDate] = useState(searchParams.get("from") || "")
  const [toDate, setToDate] = useState(searchParams.get("to") || "")

  // Sync state with URL params
  useEffect(() => {
    setPatientSearch(searchParams.get("patient") || "")
    setLocation(searchParams.get("location") || "")
    setPaymentStatus(searchParams.get("payment") || "")
    setFromDate(searchParams.get("from") || "")
    setToDate(searchParams.get("to") || "")
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (patientSearch) params.set("patient", patientSearch)
    if (location) params.set("location", location)
    if (paymentStatus) params.set("payment", paymentStatus)
    if (fromDate) params.set("from", fromDate)
    if (toDate) params.set("to", toDate)

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setPatientSearch("")
    setLocation("")
    setPaymentStatus("")
    setFromDate("")
    setToDate("")

    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-foreground text-sm">Filter Visits</h3>
        {(patientSearch || location || paymentStatus || fromDate || toDate) && (
          <button
            onClick={clearFilters}
            className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-0.5 cursor-pointer font-bold"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        {/* Patient Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-8 bg-background border-border text-foreground h-9 text-xs"
            />
          </div>
        </div>

        {/* Location Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Locations</option>
            <option value="Andheri">Andheri</option>
            <option value="Naigaon">Naigaon</option>
            <option value="Teleconsult">Teleconsult</option>
          </select>
        </div>

        {/* Payment Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid (UPI / Cash)</option>
            <option value="unpaid">Not Paid</option>
          </select>
        </div>

        {/* Action Button */}
        <Button
          onClick={applyFilters}
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer h-9"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Apply Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date From</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-background border-border text-foreground h-9 text-xs"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date To</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-background border-border text-foreground h-9 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
