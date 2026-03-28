"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FolderOpen,
  MessageSquare,
  Zap,
  Plus,
  FileText,
  ArrowRight,
  Users,
  Building2,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge, type BadgeType } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data - in real app would come from API
const mockUser = {
  name: "María García",
  email: "maria@estudio.pe",
  role: "admin" as const,
  avatarUrl: "",
  credits: 48230,
  maxCredits: 100000,
}

const mockOrganization = {
  name: "Estudio García & Asociados",
  members: 5,
  cases: 12,
  poolCredits: 250000,
}

interface Case {
  id: string
  name: string
  expedientNumber: string
  organization: string | null
  instance: "sunat" | "tribunal" | "poder-judicial"
  documentCount: number
  lastQuery: Date
  status: "active" | "archived"
}

const mockCases: Case[] = [
  {
    id: "1",
    name: "Recurso de Reclamación IGV",
    expedientNumber: "0012345-2024",
    organization: "Cliente ABC S.A.C.",
    instance: "sunat",
    documentCount: 8,
    lastQuery: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "active",
  },
  {
    id: "2",
    name: "Apelación Multas Tributarias",
    expedientNumber: "0098765-2024",
    organization: "Inversiones XYZ",
    instance: "tribunal",
    documentCount: 15,
    lastQuery: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: "active",
  },
  {
    id: "3",
    name: "Demanda Contenciosa Administrativa",
    expedientNumber: "00234-2024-0-1801",
    organization: null,
    instance: "poder-judicial",
    documentCount: 22,
    lastQuery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: "active",
  },
  {
    id: "4",
    name: "Fiscalización Renta 2023",
    expedientNumber: "0054321-2024",
    organization: "Tech Solutions Peru",
    instance: "sunat",
    documentCount: 5,
    lastQuery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: "archived",
  },
]

interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar: string
  question: string
  caseId: string
  caseName: string
  timestamp: Date
}

const mockActivity: Activity[] = [
  {
    id: "1",
    userId: "user1",
    userName: "María García",
    userAvatar: "",
    question: "¿Cuáles son los fundamentos de hecho del recurso de reclamación presentado por el contribuyente?",
    caseId: "1",
    caseName: "Recurso de Reclamación IGV",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    id: "2",
    userId: "user2",
    userName: "Carlos Pérez",
    userAvatar: "",
    question: "Resume los argumentos principales del Tribunal Fiscal en la RTF citada",
    caseId: "2",
    caseName: "Apelación Multas Tributarias",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "3",
    userId: "user1",
    userName: "María García",
    userAvatar: "",
    question: "¿Qué precedentes vinculantes aplican a este caso según la jurisprudencia del TC?",
    caseId: "3",
    caseName: "Demanda Contenciosa Administrativa",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
]

// Stats
const stats = {
  activeCases: 3,
  activeCasesLast30Days: 2,
  queriesThisMonth: 47,
  credits: mockUser.credits,
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  } else {
    return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardPage() {
  const router = useRouter()
  const [showEmptyState] = useState(false) // Toggle for demo purposes

  const isAdminOrOwner = mockUser.role === "admin" || mockUser.role === "owner"
  const hasCases = mockCases.length > 0 && !showEmptyState
  const hasActivity = mockActivity.length > 0

  // Credit status
  const creditVariant: "default" | "warning" | "danger" =
    stats.credits === 0 ? "danger" : stats.credits < 5000 ? "warning" : "default"

  const creditSubtitle =
    stats.credits === 0
      ? "Sin créditos"
      : stats.credits < 5000
        ? "Saldo bajo"
        : undefined

  return (
    <AppLayout
      currentPath="/app/dashboard"
      creditProps={{
        userName: mockUser.name,
        userRole: mockUser.role,
        availableCredits: mockUser.credits,
        totalCredits: mockUser.maxCredits,
        onLogout: () => router.push("/auth/login"),
      }}
    >
      <PageHeader
        title="Dashboard"
        breadcrumb={[{ label: "Dashboard" }]}
        actions={
          <Button
            onClick={() => router.push("/app/cases/new")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo caso
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8">
        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Casos activos"
              value={stats.activeCases}
              subtitle={`${stats.activeCasesLast30Days} en los últimos 30 días`}
              icon={FolderOpen}
            />
            <StatCard
              title="Consultas realizadas"
              value={stats.queriesThisMonth}
              subtitle="Este mes"
              icon={MessageSquare}
            />
            <StatCard
              title="Créditos disponibles"
              value={stats.credits}
              subtitle={creditSubtitle}
              icon={Zap}
              variant={creditVariant}
              action={
                stats.credits === 0
                  ? {
                      label: "Recargar",
                      onClick: () => router.push("/app/billing"),
                    }
                  : undefined
              }
            />
          </div>
        </section>

        {/* Recent Cases Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Casos recientes
            </h2>
            {hasCases && (
              <Link
                href="/app/cases"
                className="text-sm text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {hasCases ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC]">
                      <TableHead className="text-[#64748B] font-medium">
                        Nombre
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium">
                        Organización
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium">
                        Instancia
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium">
                        Documentos
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium">
                        Última consulta
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium">
                        Estado
                      </TableHead>
                      <TableHead className="text-[#64748B] font-medium text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCases.slice(0, 5).map((caseItem) => (
                      <TableRow key={caseItem.id} className="hover:bg-[#F8FAFC]">
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <FolderOpen className="h-5 w-5 text-[#64748B] mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-[#0F172A]">
                                {caseItem.name}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {caseItem.expedientNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {caseItem.organization ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB]">
                              {caseItem.organization}
                            </span>
                          ) : (
                            <StatusBadge type="personal" />
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge type={caseItem.instance as BadgeType} />
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-[#64748B]">
                            <FileText className="h-4 w-4" />
                            {caseItem.documentCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#64748B] text-sm">
                          {formatRelativeTime(caseItem.lastQuery)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge type={caseItem.status as BadgeType} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/app/cases/${caseItem.id}`)
                            }
                            className="border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
                          >
                            Abrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Card className="bg-white">
              <EmptyState
                icon={FolderOpen}
                title="No tienes casos todavía"
                description="Crea tu primer expediente para empezar a consultar documentos con IA"
                action={{
                  label: "Crear primer caso",
                  onClick: () => router.push("/app/cases/new"),
                }}
              />
            </Card>
          )}
        </section>

        {/* Recent Activity Section */}
        {hasActivity && (
          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Actividad reciente
            </h2>
            <Card className="divide-y divide-[#E2E8F0]">
              {mockActivity.slice(0, 3).map((activity) => (
                <Link
                  key={activity.id}
                  href={`/app/cases/${activity.caseId}?query=${activity.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback className="bg-[#1E3A5F] text-white text-xs">
                      {getInitials(activity.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A]">
                      {truncateText(activity.question, 80)}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {activity.caseName}
                    </p>
                  </div>
                  <span className="text-xs text-[#94A3B8] shrink-0">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </Link>
              ))}
            </Card>
          </section>
        )}

        {/* Organization Panel (Admin/Owner only) */}
        {isAdminOrOwner && (
          <section>
            <Card className="border-l-[3px] border-l-[#1E3A5F]">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#0F172A]">
                    Tu organización — {mockOrganization.name}
                  </h3>
                  <Link
                    href="/app/organizations"
                    className="text-sm text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
                  >
                    Gestionar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <Users className="h-4 w-4" />
                    <span>{mockOrganization.members} miembros</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <FolderOpen className="h-4 w-4" />
                    <span>{mockOrganization.cases} casos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {mockOrganization.poolCredits.toLocaleString("es-PE")}{" "}
                      créditos en pool
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
