"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Users, FolderOpen, Zap, User, ChevronRight } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Types
type UserRole = "owner" | "admin" | "lawyer"
type PlanType = "free" | "starter" | "pro"

interface Organization {
  id: string
  name: string
  ruc?: string
  role: UserRole
  plan: PlanType
  membersCount: number
  activeCasesCount: number
  poolCredits: number
}

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Estudio Jurídico Pérez & Asociados",
    ruc: "20123456789",
    role: "owner",
    plan: "pro",
    membersCount: 12,
    activeCasesCount: 34,
    poolCredits: 250000,
  },
  {
    id: "org-2",
    name: "Bufete Legal Torres",
    ruc: "20987654321",
    role: "admin",
    plan: "starter",
    membersCount: 5,
    activeCasesCount: 18,
    poolCredits: 75000,
  },
  {
    id: "org-3",
    name: "Consultores Legales SAC",
    role: "lawyer",
    plan: "free",
    membersCount: 3,
    activeCasesCount: 7,
    poolCredits: 10000,
  },
]

const personalSpace = {
  casesCount: 5,
  freeCredits: 10000,
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case "owner":
      return "bg-[#1E3A5F] text-white"
    case "admin":
      return "bg-[#2563EB] text-white"
    case "lawyer":
      return "bg-[#64748B] text-white"
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case "owner":
      return "Owner"
    case "admin":
      return "Admin"
    case "lawyer":
      return "Lawyer"
  }
}

function getPlanBadgeVariant(plan: PlanType) {
  switch (plan) {
    case "free":
      return "bg-[#E2E8F0] text-[#64748B]"
    case "starter":
      return "bg-[#DBEAFE] text-[#2563EB]"
    case "pro":
      return "bg-[#FEF3C7] text-[#D97706]"
  }
}

function getPlanLabel(plan: PlanType) {
  switch (plan) {
    case "free":
      return "Free"
    case "starter":
      return "Starter"
    case "pro":
      return "Pro"
  }
}

// Components
function PersonalSpaceCard() {
  return (
    <Card className="border-[#E2E8F0] bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <User className="h-6 w-6 text-[#64748B]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Espacio personal
            </h3>
            <p className="text-sm text-[#64748B]">
              Casos y documentos privados, solo visibles para ti
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">
              {personalSpace.casesCount} casos personales
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">
              {personalSpace.freeCredits.toLocaleString("es-PE")} créditos
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
          asChild
        >
          <Link href="/app/cases?filter=personal">
            Ver mis casos personales
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function OrganizationCard({ org }: { org: Organization }) {
  const canSeeCredits = org.role === "owner" || org.role === "admin"

  return (
    <Card className="border-[#E2E8F0] bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(org.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#0F172A]">
                  {org.name}
                </h3>
                <Badge className={getRoleBadgeVariant(org.role)}>
                  {getRoleLabel(org.role)}
                </Badge>
              </div>
              {org.ruc && (
                <p className="text-xs text-[#94A3B8] mt-0.5">RUC: {org.ruc}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">
              {org.membersCount} miembros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">
              {org.activeCasesCount} casos activos
            </span>
          </div>
          {canSeeCredits && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm text-[#64748B]">
                Pool: {org.poolCredits.toLocaleString("es-PE")}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Badge className={getPlanBadgeVariant(org.plan)}>
            {getPlanLabel(org.plan)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
          asChild
        >
          <Link href={`/app/organizations/${org.id}`}>
            Ver organización
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function CreateOrgCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-[#E2E8F0] flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-[#64748B]" />
        </div>
        <h3 className="text-base font-medium text-[#64748B]">
          Crear organización
        </h3>
        <p className="text-sm text-[#94A3B8] mt-1 text-center">
          Crea un estudio para colaborar con tu equipo
        </p>
      </CardContent>
    </Card>
  )
}

function CreateOrganizationSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [ruc, setRuc] = useState("")
  const [rucError, setRucError] = useState("")

  const initials = name ? getInitials(name) : "??"

  const validateRuc = (value: string) => {
    if (!value) {
      setRucError("")
      return true
    }
    if (!/^\d{11}$/.test(value)) {
      setRucError("El RUC debe tener 11 dígitos")
      return false
    }
    if (!value.startsWith("10") && !value.startsWith("20")) {
      setRucError("El RUC debe empezar con 10 o 20")
      return false
    }
    setRucError("")
    return true
  }

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setRuc(value)
    if (value.length === 11 || value.length === 0) {
      validateRuc(value)
    } else {
      setRucError("")
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    if (ruc && !validateRuc(ruc)) return
    // TODO: Create organization
    onOpenChange(false)
    setName("")
    setRuc("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setName("")
    setRuc("")
    setRucError("")
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-[#0F172A]">Nueva organización</SheetTitle>
          <SheetDescription className="text-[#64748B]">
            Crea una organización para colaborar con tu equipo legal.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Organization name */}
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-[#0F172A]">
              Nombre de la organización <span className="text-red-500">*</span>
            </Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Estudio Jurídico Pérez & Asociados"
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
            />
          </div>

          {/* RUC */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="org-ruc" className="text-[#0F172A]">
                RUC
              </Label>
              <span className="text-xs text-[#94A3B8]">(opcional)</span>
            </div>
            <Input
              id="org-ruc"
              value={ruc}
              onChange={handleRucChange}
              placeholder="20123456789"
              className={`border-[#E2E8F0] focus-visible:ring-[#2563EB] ${
                rucError ? "border-red-500" : ""
              }`}
            />
            {rucError ? (
              <p className="text-xs text-red-500">{rucError}</p>
            ) : (
              <p className="text-xs text-[#94A3B8]">
                Registro Único de Contribuyente peruano
              </p>
            )}
          </div>

          {/* Logo preview */}
          <div className="space-y-3">
            <Label className="text-[#0F172A]">Vista previa del logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-semibold text-xl">
                {initials}
              </div>
              <p className="text-xs text-[#94A3B8] flex-1">
                Tu logo se generará automáticamente con las iniciales
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8">
          <div className="w-full space-y-4">
            <p className="text-xs text-[#94A3B8] text-center">
              Al crear la organización, pasarás a ser el administrador principal
              (owner).
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-[#E2E8F0] text-[#64748B]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                Crear organización
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default function OrganizationsPage() {
  const [createSheetOpen, setCreateSheetOpen] = useState(false)

  const hasOrganizations = mockOrganizations.length > 0

  return (
    <AppLayout
      currentPath="/app/organizations"
      creditProps={{
        availableCredits: 42500,
        totalCredits: 100000,
        userName: "Carlos Mendoza",
        userRole: "owner",
        onLogout: () => {},
      }}
    >
      <PageHeader
        title="Organizaciones"
        breadcrumb={[{ label: "Organizaciones" }]}
        actions={
          <Button
            onClick={() => setCreateSheetOpen(true)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear organización
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal space card - always first */}
          <PersonalSpaceCard />

          {/* Organization cards */}
          {hasOrganizations ? (
            mockOrganizations.map((org) => (
              <OrganizationCard key={org.id} org={org} />
            ))
          ) : (
            <CreateOrgCard onClick={() => setCreateSheetOpen(true)} />
          )}
        </div>
      </div>

      {/* Create organization sheet */}
      <CreateOrganizationSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
      />
    </AppLayout>
  )
}
