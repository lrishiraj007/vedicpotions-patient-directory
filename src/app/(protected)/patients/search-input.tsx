"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition, useEffect, useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const currentSearch = searchParams.get("search") || ""
    if (value === currentSearch) return

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      params.delete("page") // Reset page query on new search string

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 350)

    return () => clearTimeout(handler)
  }, [value, pathname, router, searchParams])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search patients by name or contact..."
        className="pl-9 bg-background border-border text-foreground w-full text-sm h-9"
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
