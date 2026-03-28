"use client"

import { cn } from "@/lib/utils"

interface ItacappLogoProps {
  variant?: "light" | "dark"
  className?: string
}

export function ItacappLogo({ variant = "dark", className }: ItacappLogoProps) {
  const color = variant === "light" ? "#FFFFFF" : "#1E3A5F"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Scale/Balance Icon */}
        <rect x="13" y="2" width="2" height="6" rx="1" fill={color} />
        <circle cx="14" cy="2" r="2" fill={color} />
        <path
          d="M4 10L14 7L24 10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="13" y="7" width="2" height="16" fill={color} />
        <rect x="8" y="23" width="12" height="3" rx="1.5" fill={color} />
        {/* Left scale pan */}
        <path
          d="M2 12L4 10L6 12L7 18H1L2 12Z"
          fill={color}
          fillOpacity="0.85"
        />
        <ellipse cx="4" cy="18" rx="3.5" ry="1" fill={color} />
        {/* Right scale pan */}
        <path
          d="M22 12L24 10L26 12L27 18H21L22 12Z"
          fill={color}
          fillOpacity="0.85"
        />
        <ellipse cx="24" cy="18" rx="3.5" ry="1" fill={color} />
      </svg>
      <span
        className="text-lg font-semibold"
        style={{ color }}
      >
        Itacapp
      </span>
    </div>
  )
}
