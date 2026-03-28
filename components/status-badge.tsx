"use client"

import { cn } from "@/lib/utils"

export type BadgeType =
  | "active"
  | "archived"
  | "pending"
  | "processing"
  | "ready"
  | "error"
  | "personal"
  | "sunat"
  | "tribunal"
  | "poder-judicial"
  | "owner"
  | "admin"
  | "lawyer"
  | "min"
  | "medium"
  | "advanced"

interface StatusBadgeProps {
  type: BadgeType
  className?: string
}

const badgeConfig: Record<
  BadgeType,
  { label: string; bg: string; text: string; hasSpinner?: boolean }
> = {
  active: {
    label: "Activo",
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
  },
  archived: {
    label: "Archivado",
    bg: "bg-[#F1F5F9]",
    text: "text-[#64748B]",
  },
  pending: {
    label: "Pendiente",
    bg: "bg-[#FFFBEB]",
    text: "text-[#D97706]",
    hasSpinner: true,
  },
  processing: {
    label: "Procesando",
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
    hasSpinner: true,
  },
  ready: {
    label: "Listo",
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
  },
  error: {
    label: "Error",
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
  },
  personal: {
    label: "Personal",
    bg: "bg-[#F1F5F9]",
    text: "text-[#64748B]",
  },
  sunat: {
    label: "SUNAT",
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
  },
  tribunal: {
    label: "Tribunal Fiscal",
    bg: "bg-[#F5F3FF]",
    text: "text-[#7C3AED]",
  },
  "poder-judicial": {
    label: "Poder Judicial",
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
  },
  owner: {
    label: "Propietario",
    bg: "bg-[#1E3A5F]",
    text: "text-white",
  },
  admin: {
    label: "Administrador",
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
  },
  lawyer: {
    label: "Abogado",
    bg: "bg-[#F1F5F9]",
    text: "text-[#475569]",
  },
  min: {
    label: "Mínimo",
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
  },
  medium: {
    label: "Medio",
    bg: "bg-[#FFFBEB]",
    text: "text-[#D97706]",
  },
  advanced: {
    label: "Avanzado",
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
  },
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-3 w-3", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function StatusBadge({ type, className }: StatusBadgeProps) {
  const config = badgeConfig[type]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      {config.hasSpinner && <Spinner />}
      {type === "ready" && (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {config.label}
    </span>
  )
}
