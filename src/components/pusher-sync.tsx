"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPusherClient } from "@/lib/pusher-client"

export function PusherSync() {
  const router = useRouter()

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = "private-practice-updates"
    const channel = pusher.subscribe(channelName)

    channel.bind("mutation", () => {
      // Trigger a soft data refresh on all server components in current view
      router.refresh()
    })

    return () => {
      channel.unbind("mutation")
      pusher.unsubscribe(channelName)
    }
  }, [router])

  return null
}
