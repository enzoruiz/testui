"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FolderOpen,
  Building2,
  User,
  BarChart3,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ItacappLogo } from "./itacapp-logo"
import { CreditWidget, type CreditWidgetProps } from "./credit-widget"

export interface AppLayoutProps {
  children: React.ReactNode
  currentPath: string
  creditProps: CreditWidgetProps
  processingCount?: number
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app/dashboard" },
  { icon: FolderOpen, label: "Casos", href: "/app/cases" },
  { icon: Building2, label: "Organizaciones", href: "/app/organizations" },
  { icon: User, label: "Perfil", href: "/app/profile" },
]

const adminNavItems: NavItem[] = [
  { icon: BarChart3, label: "Administración", href: "/app/admin", adminOnly: true },
]

export function AppLayout({
  children,
  currentPath,
  creditProps,
  processingCount = 0,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdminUser =
    creditProps.userRole === "owner" || creditProps.userRole === "admin"

  const renderNavItem = (item: NavItem) => {
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")
    const Icon = item.icon
    const showBadge = item.href === "/app/cases" && processingCount > 0

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 h-10 px-5 mx-2 rounded-md transition-colors",
          isActive
            ? "bg-white/12 text-white border-l-[3px] border-l-white pl-[17px]"
            : "text-white/65 hover:bg-white/8 hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="relative">
          <Icon className="h-5 w-5" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#F97316] text-white text-[10px] font-medium flex items-center justify-center">
              {processingCount > 9 ? "9+" : processingCount}
            </span>
          )}
        </div>
        <span className="text-sm">{item.label}</span>
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-5 pb-2">
        <ItacappLogo variant="light" />
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1">
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>

        {/* Admin section */}
        {isAdminUser && (
          <>
            <div className="h-px bg-white/15 mx-4 my-4" />
            <div className="space-y-1">
              {adminNavItems.map(renderNavItem)}
            </div>
          </>
        )}
      </nav>

      {/* Credit widget at bottom */}
      <div className="mt-auto">
        <CreditWidget {...creditProps} />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-[#1E3A5F] flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-[#0F172A] hover:bg-[#F1F5F9] rounded-md"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
        <ItacappLogo variant="dark" />
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-60 bg-[#1E3A5F] flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 text-white/65 hover:text-white rounded"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="md:ml-60 min-h-screen pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
