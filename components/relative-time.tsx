"use client"

import { useState, useEffect } from "react"

interface RelativeTimeProps {
  date: Date
  className?: string
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "ahora"
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays === 1) return "ayer"
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false)
  const [relativeTime, setRelativeTime] = useState<string>("")

  useEffect(() => {
    setMounted(true)
    setRelativeTime(formatRelativeDate(date))

    // Update every minute for recent times
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeDate(date))
    }, 60000)

    return () => clearInterval(interval)
  }, [date])

  // Return a static placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return <span className={className}>—</span>
  }

  return <span className={className}>{relativeTime}</span>
}
