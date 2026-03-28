"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 bg-white border-b border-[#E2E8F0] px-8 py-4",
        className
      )}
    >
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-sm mb-2">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1
            return (
              <span key={index} className="flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast ? "text-[#0F172A] font-medium" : "text-[#64748B]"
                    )}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                )}
              </span>
            )
          })}
        </nav>
      )}

      {/* Title row + actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
