"use client"

import { useState } from "react"
import Link from "next/link"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Building2,
  ChevronRight,
  Download,
  AlertCircle,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RelativeTime } from "@/components/relative-time"

// Types
type TransactionType = "consulta" | "ingesta" | "asignacion" | "inicial"
type UserRole = "owner" | "admin" | "lawyer"

interface UserOrganization {
  id: string
  name: string
  role: UserRole
  creditsAssigned: number
}

interface CreditTransaction {
  id: string
  date: Date
  type: TransactionType
  description: string
  delta: number
  balance: number
}

// Mock data
const mockUser = {
  name: "Carlos Mendoza",
  email: "carlos@perezasociados.pe",
  authProvider: "google" as const,
  registeredAt: new Date(2024, 0, 15),
  lastLogin: new Date(2026, 2, 28, 9, 30),
  availableCredits: 42797,
  totalCredits: 100000,
  creditSource: "Estudio Jurídico Pérez & Asociados",
}

const mockOrganizations: UserOrganization[] = [
  {
    id: "org-1",
    name: "Estudio Jurídico Pérez & Asociados",
    role: "owner",
    creditsAssigned: 50000,
  },
  {
    id: "org-2",
    name: "Bufete Legal Torres",
    role: "admin",
    creditsAssigned: 30000,
  },
  {
    id: "org-3",
    name: "Consultores Legales SAC",
    role: "lawyer",
    creditsAssigned: 20000,
  },
]

const mockTransactions: CreditTransaction[] = [
  {
    id: "tx-1",
    date: new Date(2026, 2, 28, 14, 30),
    type: "consulta",
    description: "¿Cuál es el plazo para apelar...?",
    delta: -7203,
    balance: 42797,
  },
  {
    id: "tx-2",
    date: new Date(2026, 2, 27, 10, 15),
    type: "ingesta",
    description: "resolucion_apelacion.pdf",
    delta: -12000,
    balance: 50000,
  },
  {
    id: "tx-3",
    date: new Date(2026, 2, 26, 16, 45),
    type: "consulta",
    description: "¿Qué requisitos necesito para...?",
    delta: -5420,
    balance: 62000,
  },
  {
    id: "tx-4",
    date: new Date(2026, 2, 25, 9, 0),
    type: "asignacion",
    description: "Asignación mensual marzo",
    delta: 17420,
    balance: 67420,
  },
  {
    id: "tx-5",
    date: new Date(2026, 2, 1, 0, 0),
    type: "inicial",
    description: "Créditos gratuitos iniciales",
    delta: 50000,
    balance: 50000,
  },
]

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

function getTransactionBadgeVariant(type: TransactionType) {
  switch (type) {
    case "consulta":
      return "bg-[#FEF3C7] text-[#D97706]"
    case "ingesta":
      return "bg-[#F3E8FF] text-[#9333EA]"
    case "asignacion":
      return "bg-[#DBEAFE] text-[#2563EB]"
    case "inicial":
      return "bg-[#DCFCE7] text-[#16A34A]"
  }
}

function getTransactionLabel(type: TransactionType) {
  switch (type) {
    case "consulta":
      return "Consulta"
    case "ingesta":
      return "Ingesta"
    case "asignacion":
      return "Asignación"
    case "inicial":
      return "Inicial"
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

// Components
function EditNameDialog({
  open,
  onOpenChange,
  currentName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
}) {
  const [name, setName] = useState(currentName)

  const handleSubmit = () => {
    if (!name.trim()) return
    // TODO: Update name
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[#0F172A]">Editar nombre</DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Actualiza tu nombre de usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name" className="text-[#0F172A]">
            Nombre completo
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#E2E8F0] text-[#64748B]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfilePage() {
  const [editNameOpen, setEditNameOpen] = useState(false)
  const user = mockUser

  const creditPercent =
    user.totalCredits > 0
      ? (user.availableCredits / user.totalCredits) * 100
      : 0
  const isOutOfCredits = user.availableCredits === 0
  const hasOrganization = mockOrganizations.length > 0

  const exportHistory = () => {
    // TODO: Export CSV
    const csv = mockTransactions
      .map(
        (tx) =>
          `${formatDate(tx.date)},${getTransactionLabel(tx.type)},${tx.description},${tx.delta},${tx.balance}`
      )
      .join("\n")
    const header = "Fecha,Tipo,Descripción,Créditos,Saldo\n"
    const blob = new Blob([header + csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "historial_creditos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout
      currentPath="/app/profile"
      creditProps={{
        availableCredits: user.availableCredits,
        totalCredits: user.totalCredits,
        userName: user.name,
        userRole: "owner",
        onLogout: () => {},
      }}
    >
      <PageHeader
        title="Mi perfil"
        breadcrumb={[{ label: "Perfil" }]}
      />

      <div className="p-8 max-w-3xl mx-auto space-y-6">
        {/* Personal info card */}
        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-xl shrink-0">
                {getInitials(user.name)}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xl font-semibold text-[#0F172A]">
                    {user.name}
                  </p>
                  <p className="text-sm text-[#64748B] flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditNameOpen(true)}
                    className="border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  >
                    Editar nombre
                  </Button>
                  {user.authProvider !== "google" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                    >
                      Cambiar contraseña
                    </Button>
                  )}
                </div>

                {user.authProvider === "google" && (
                  <Badge className="bg-[#EFF6FF] text-[#2563EB]">
                    <svg className="h-3 w-3 mr-1.5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Cuenta vinculada con Google
                  </Badge>
                )}

                <div className="flex items-center gap-6 text-sm text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Registrado: {formatDate(user.registeredAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Último login: <RelativeTime date={user.lastLogin} />
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits card */}
        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Mis créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-[#0F172A]">
                {user.availableCredits.toLocaleString("es-PE")}
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                créditos disponibles
              </p>
            </div>

            <Progress
              value={creditPercent}
              className="h-2 bg-[#E2E8F0]"
            />

            {hasOrganization ? (
              <p className="text-sm text-[#64748B]">
                Asignados por{" "}
                <span className="font-medium text-[#0F172A]">
                  {user.creditSource}
                </span>
              </p>
            ) : (
              <Badge className="bg-[#F1F5F9] text-[#64748B]">
                Créditos gratuitos · Plan personal
              </Badge>
            )}

            {isOutOfCredits && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Te quedaste sin créditos. Contacta al administrador de tu
                  organización para obtener más.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Organizations card */}
        {mockOrganizations.length > 0 && (
          <Card className="border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-[#0F172A]">
                Mis organizaciones
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-[#2563EB]">
                <Link href="/app/organizations">
                  Gestionar
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(org.name)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{org.name}</p>
                        <Badge
                          className={`mt-0.5 ${getRoleBadgeVariant(org.role)}`}
                        >
                          {getRoleLabel(org.role)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {org.creditsAssigned.toLocaleString("es-PE")} créditos
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction history */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-[#0F172A]">
              Historial de créditos
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              className="border-[#E2E8F0] text-[#64748B]"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar historial
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                <TableHead className="text-[#64748B]">Fecha</TableHead>
                <TableHead className="text-[#64748B]">Tipo</TableHead>
                <TableHead className="text-[#64748B]">Descripción</TableHead>
                <TableHead className="text-[#64748B] text-right">
                  Créditos
                </TableHead>
                <TableHead className="text-[#64748B] text-right">
                  Saldo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-[#E2E8F0]">
                  <TableCell className="text-[#64748B]">
                    <RelativeTime date={tx.date} />
                  </TableCell>
                  <TableCell>
                    <Badge className={getTransactionBadgeVariant(tx.type)}>
                      {getTransactionLabel(tx.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#0F172A] max-w-[200px]">
                    {truncate(tx.description, 35)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.delta > 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                    }`}
                  >
                    {tx.delta > 0 ? "+" : ""}
                    {tx.delta.toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right text-[#64748B]">
                    {tx.balance.toLocaleString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <EditNameDialog
        open={editNameOpen}
        onOpenChange={setEditNameOpen}
        currentName={user.name}
      />
    </AppLayout>
  )
}
