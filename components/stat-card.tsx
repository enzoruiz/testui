"use client"

import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: "default" | "warning" | "danger"
  action?: { label: string; onClick: () => void }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  action,
}: StatCardProps) {
  const isPositive = trend ? trend.value >= 0 : false

  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        variant === "default" && "bg-white border-[#E2E8F0]",
        variant === "warning" &&
          "bg-[#FFFBEB] border-[#E2E8F0] border-l-4 border-l-[#D97706]",
        variant === "danger" &&
          "bg-[#FEF2F2] border-[#E2E8F0] border-l-4 border-l-[#DC2626]"
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#64748B]">{title}</span>
        <Icon className="h-6 w-6 text-[#1E3A5F]" />
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-[#0F172A]">
        {typeof value === "number" ? value.toLocaleString("es-PE") : value}
      </p>

      {/* Subtitle */}
      {subtitle && <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>}

      {/* Trend */}
      {trend && (
        <div
          className={cn(
            "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-medium",
            isPositive ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {trend.value}% {trend.label}
        </div>
      )}

      {/* Action button (primarily for danger variant) */}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-3 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
