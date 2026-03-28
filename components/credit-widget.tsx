"use client"

import { LogOut, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export type UserRole = "owner" | "admin" | "lawyer" | "personal"

export interface CreditWidgetProps {
  availableCredits: number
  totalCredits: number
  userName: string
  userRole: UserRole
  onLogout: () => void
}

const roleLabels: Record<UserRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  lawyer: "Abogado",
  personal: "Personal",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function CreditWidget({
  availableCredits = 0,
  totalCredits = 0,
  userName,
  userRole,
  onLogout,
}: CreditWidgetProps) {
  const credits = availableCredits ?? 0
  const total = totalCredits ?? 0
  const percentage = total > 0 ? (credits / total) * 100 : 0
  const isOutOfCredits = credits === 0
  const isLowCredits = !isOutOfCredits && percentage < 10

  const getProgressColor = () => {
    if (isOutOfCredits) return "bg-[#DC2626]"
    if (isLowCredits) return "bg-[#F59E0B]"
    return "bg-white"
  }

  return (
    <div className="px-4 pb-4">
      {/* Separator */}
      <div className="h-px bg-white/20 mb-4" />

      {/* User row */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          {getInitials(userName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{userName}</p>
          <span className="text-xs text-white/50">{roleLabels[userRole]}</span>
        </div>
      </div>

      {/* Credit section */}
      <div className="space-y-2">
        <p className="text-xs text-white/60">Créditos disponibles</p>
        <div className="flex items-center gap-2">
          {isOutOfCredits && (
            <AlertTriangle className="h-4 w-4 text-red-200 animate-pulse" />
          )}
          <span
            className={cn(
              "text-base font-semibold",
              isOutOfCredits ? "text-red-200" : "text-white"
            )}
          >
            {isOutOfCredits
              ? "Sin créditos"
              : credits.toLocaleString("es-PE")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getProgressColor())}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
      </div>

      {/* Logout row */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 mt-4 text-xs text-white/60 hover:text-white transition-colors w-full"
      >
        <LogOut className="h-4 w-4" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}
