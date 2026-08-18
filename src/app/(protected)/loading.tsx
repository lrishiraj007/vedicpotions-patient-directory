import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm text-zinc-100 font-sans">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated pulse loader container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-emerald-500/10 opacity-75"></div>
          <div className="relative h-12 w-12 rounded-full border border-emerald-950 bg-zinc-900 flex items-center justify-center shadow-xl">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          </div>
        </div>
        
        {/* Subtext indicator */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold tracking-wide text-zinc-200">Retrieving Records...</p>
          <p className="text-[10px] text-zinc-500 font-medium">Fetching clinic database indexes</p>
        </div>
      </div>
    </div>
  )
}
