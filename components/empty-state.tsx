"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className
      )}
    >
      <Icon className="h-12 w-12 text-[#CBD5E1] mb-4" />
      <h3 className="text-base font-medium text-[#64748B] mb-2">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-[320px] text-center">
        {description}
      </p>
      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          className="mt-4 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
