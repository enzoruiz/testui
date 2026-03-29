"use client"

import { useState, use } from "react"
import Link from "next/link"
import {
  Users,
  FolderOpen,
  Zap,
  Search,
  MoreHorizontal,
  Mail,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RelativeTime } from "@/components/relative-time"

// Types
type UserRole = "owner" | "admin" | "lawyer"
type PlanType = "free" | "starter" | "pro"
type TransactionType = "recarga" | "asignacion" | "consulta" | "ingesta"

interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  casesAssigned: number
  creditsAvailable: number
  creditsTotal: number
  memberSince: Date
}

interface CreditTransaction {
  id: string
  date: Date
  type: TransactionType
  user: string
  delta: number
  note?: string
}

interface Organization {
  id: string
  name: string
  ruc?: string
  myRole: UserRole
  plan: PlanType
  membersCount: number
  activeCasesCount: number
  poolCredits: number
  totalMonthlyCredits: number
  distributedCredits: number
  nextRenewal: Date
}

// Mock data
const mockOrganization: Organization = {
  id: "org-1",
  name: "Estudio Jurídico Pérez & Asociados",
  ruc: "20123456789",
  myRole: "owner",
  plan: "pro",
  membersCount: 12,
  activeCasesCount: 34,
  poolCredits: 250000,
  totalMonthlyCredits: 500000,
  distributedCredits: 250000,
  nextRenewal: new Date(2026, 3, 15),
}

const mockMembers: Member[] = [
  {
    id: "user-1",
    name: "Carlos Mendoza",
    email: "carlos@perezasociados.pe",
    role: "owner",
    casesAssigned: 8,
    creditsAvailable: 45000,
    creditsTotal: 50000,
    memberSince: new Date(2024, 0, 15),
  },
  {
    id: "user-2",
    name: "María García",
    email: "maria@perezasociados.pe",
    role: "admin",
    casesAssigned: 12,
    creditsAvailable: 32000,
    creditsTotal: 50000,
    memberSince: new Date(2024, 2, 10),
  },
  {
    id: "user-3",
    name: "José Rodríguez",
    email: "jose@perezasociados.pe",
    role: "lawyer",
    casesAssigned: 6,
    creditsAvailable: 8500,
    creditsTotal: 25000,
    memberSince: new Date(2024, 5, 22),
  },
  {
    id: "user-4",
    name: "Ana Sánchez",
    email: "ana@perezasociados.pe",
    role: "lawyer",
    casesAssigned: 4,
    creditsAvailable: 0,
    creditsTotal: 20000,
    memberSince: new Date(2024, 8, 5),
  },
]

const mockTransactions: CreditTransaction[] = [
  {
    id: "tx-1",
    date: new Date(2026, 2, 28, 14, 30),
    type: "asignacion",
    user: "María García",
    delta: 10000,
    note: "Asignación mensual",
  },
  {
    id: "tx-2",
    date: new Date(2026, 2, 27, 10, 15),
    type: "consulta",
    user: "José Rodríguez",
    delta: -7203,
  },
  {
    id: "tx-3",
    date: new Date(2026, 2, 26, 16, 45),
    type: "ingesta",
    user: "Carlos Mendoza",
    delta: -12000,
  },
  {
    id: "tx-4",
    date: new Date(2026, 2, 25, 9, 0),
    type: "recarga",
    user: "Sistema",
    delta: 500000,
    note: "Renovación mensual Plan Pro",
  },
  {
    id: "tx-5",
    date: new Date(2026, 2, 24, 11, 30),
    type: "consulta",
    user: "Ana Sánchez",
    delta: -5420,
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

function getTransactionBadgeVariant(type: TransactionType) {
  switch (type) {
    case "recarga":
      return "bg-[#DCFCE7] text-[#16A34A]"
    case "asignacion":
      return "bg-[#DBEAFE] text-[#2563EB]"
    case "consulta":
      return "bg-[#FEF3C7] text-[#D97706]"
    case "ingesta":
      return "bg-[#F3E8FF] text-[#9333EA]"
  }
}

function getTransactionLabel(type: TransactionType) {
  switch (type) {
    case "recarga":
      return "Recarga"
    case "asignacion":
      return "Asignación"
    case "consulta":
      return "Consulta"
    case "ingesta":
      return "Ingesta"
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Components
function AssignCreditsDialog({
  member,
  open,
  onOpenChange,
  poolCredits,
}: {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
  poolCredits: number
}) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  const amountNum = parseInt(amount) || 0
  const hasError = amountNum > poolCredits
  const remaining = poolCredits - amountNum

  const handleQuickAdd = (value: number) => {
    setAmount((prev) => {
      const current = parseInt(prev) || 0
      return String(current + value)
    })
  }

  const handleSubmit = () => {
    if (!member || hasError || amountNum === 0) return
    // TODO: Assign credits
    onOpenChange(false)
    setAmount("")
    setNote("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setAmount("")
    setNote("")
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0F172A]">Asignar créditos</DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Asigna créditos del pool de la organización a este miembro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-sm">
              {getInitials(member.name)}
            </div>
            <div>
              <p className="font-medium text-[#0F172A]">{member.name}</p>
              <p className="text-sm text-[#64748B]">
                Saldo actual: {member.creditsAvailable.toLocaleString("es-PE")} créditos
              </p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[#0F172A]">
              Cantidad a asignar
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={`border-[#E2E8F0] focus-visible:ring-[#2563EB] ${
                hasError ? "border-red-500" : ""
              }`}
            />
            {hasError && (
              <p className="text-xs text-red-500">
                No hay suficientes créditos en el pool
              </p>
            )}
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(10000)}
              className="border-[#E2E8F0] text-[#64748B]"
            >
              +10,000
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(50000)}
              className="border-[#E2E8F0] text-[#64748B]"
            >
              +50,000
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(100000)}
              className="border-[#E2E8F0] text-[#64748B]"
            >
              +100,000
            </Button>
          </div>

          {/* Pool remaining */}
          <p className="text-sm text-[#64748B]">
            Pool disponible:{" "}
            <span className={hasError ? "text-red-500 font-medium" : ""}>
              Quedarán {Math.max(0, remaining).toLocaleString("es-PE")} créditos
            </span>
          </p>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-[#0F172A]">
              Nota interna{" "}
              <span className="text-xs text-[#94A3B8]">(opcional)</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Asignación mensual marzo"
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB] resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#E2E8F0] text-[#64748B]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={hasError || amountNum === 0}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            Asignar créditos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [credits, setCredits] = useState("0")

  const handleSubmit = () => {
    if (!email.trim()) return
    // TODO: Send invitation
    onOpenChange(false)
    setEmail("")
    setCredits("0")
  }

  const handleClose = () => {
    onOpenChange(false)
    setEmail("")
    setCredits("0")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0F172A]">Invitar lawyer</DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Envía una invitación para unirse a la organización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0F172A]">
              Email del abogado
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abogado@ejemplo.com"
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-credits" className="text-[#0F172A]">
              Créditos iniciales
            </Label>
            <Input
              id="initial-credits"
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="0"
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
            />
          </div>

          <p className="text-sm text-[#94A3B8] flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 shrink-0" />
            Se enviará una invitación al correo indicado
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#E2E8F0] text-[#64748B]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!email.trim()}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            Enviar invitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MembersTab({
  members,
  myRole,
  poolCredits,
}: {
  members: Member[]
  myRole: UserRole
  poolCredits: number
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAssignCredits = (member: Member) => {
    setSelectedMember(member)
    setAssignDialogOpen(true)
  }

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member)
    setRemoveDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Search + Invite */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-10 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
          />
        </div>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
        >
          <Mail className="h-4 w-4 mr-2" />
          Invitar lawyer
        </Button>
      </div>

      {/* Members table */}
      <Card className="border-[#E2E8F0]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="text-[#64748B]">Miembro</TableHead>
              <TableHead className="text-[#64748B]">Email</TableHead>
              <TableHead className="text-[#64748B]">Rol</TableHead>
              <TableHead className="text-[#64748B] text-center">
                Casos
              </TableHead>
              <TableHead className="text-[#64748B]">Créditos</TableHead>
              <TableHead className="text-[#64748B]">Miembro desde</TableHead>
              <TableHead className="text-[#64748B] w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => {
              const creditPercent =
                member.creditsTotal > 0
                  ? (member.creditsAvailable / member.creditsTotal) * 100
                  : 0

              return (
                <TableRow key={member.id} className="border-[#E2E8F0]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-xs">
                        {getInitials(member.name)}
                      </div>
                      <span className="font-medium text-[#0F172A]">
                        {member.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeVariant(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-[#0F172A]">
                    {member.casesAssigned}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="text-sm text-[#0F172A]">
                        {member.creditsAvailable.toLocaleString("es-PE")}
                      </span>
                      <Progress
                        value={creditPercent}
                        className="h-1.5 w-20 bg-[#E2E8F0]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {formatDate(member.memberSince)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAssignCredits(member)}
                        >
                          Asignar créditos
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver créditos</DropdownMenuItem>
                        {myRole === "owner" && member.role === "lawyer" && (
                          <DropdownMenuItem>Promover a Admin</DropdownMenuItem>
                        )}
                        {member.role !== "owner" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRemoveMember(member)}
                            >
                              Remover de la organización
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Dialogs */}
      <AssignCreditsDialog
        member={selectedMember}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        poolCredits={poolCredits}
      />
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove && (
                <>
                  Estás a punto de remover a{" "}
                  <strong>{memberToRemove.name}</strong> de la organización.
                  Esta persona perderá acceso a todos los casos y documentos
                  compartidos.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E2E8F0] text-[#64748B]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreditsTab({ org }: { org: Organization }) {
  const distributionPercent =
    org.totalMonthlyCredits > 0
      ? (org.distributedCredits / org.totalMonthlyCredits) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Pool summary card */}
      <Card className="border-[#E2E8F0]">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Créditos en pool</p>
              <p className="text-3xl font-bold text-[#0F172A]">
                {org.poolCredits.toLocaleString("es-PE")}
              </p>
              <p className="text-sm text-[#94A3B8] mt-1">
                Disponibles para distribuir entre miembros
              </p>
            </div>
            <Zap className="h-8 w-8 text-[#2563EB]" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Créditos distribuidos</span>
              <span className="text-[#0F172A]">
                {org.distributedCredits.toLocaleString("es-PE")} /{" "}
                {org.totalMonthlyCredits.toLocaleString("es-PE")}
              </span>
            </div>
            <Progress value={distributionPercent} className="h-2 bg-[#E2E8F0]" />
          </div>
        </CardContent>
      </Card>

      {/* Distribution table */}
      <Card className="border-[#E2E8F0]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0F172A]">
            Distribución por usuario
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="text-[#64748B]">Usuario</TableHead>
              <TableHead className="text-[#64748B] text-right">
                Asignados
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Consumidos
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Disponibles
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                % del total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMembers.map((member) => {
              const consumed = member.creditsTotal - member.creditsAvailable
              const percentOfTotal =
                org.totalMonthlyCredits > 0
                  ? (member.creditsTotal / org.totalMonthlyCredits) * 100
                  : 0

              return (
                <TableRow key={member.id} className="border-[#E2E8F0]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-xs">
                        {getInitials(member.name)}
                      </div>
                      <span className="font-medium text-[#0F172A]">
                        {member.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-[#0F172A]">
                    {member.creditsTotal.toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right text-[#DC2626]">
                    {consumed.toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right text-[#16A34A]">
                    {member.creditsAvailable.toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right text-[#64748B]">
                    {percentOfTotal.toFixed(1)}%
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction history */}
      <Card className="border-[#E2E8F0]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0F172A]">
            Historial de transacciones
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="text-[#64748B]">Fecha</TableHead>
              <TableHead className="text-[#64748B]">Tipo</TableHead>
              <TableHead className="text-[#64748B]">Usuario</TableHead>
              <TableHead className="text-[#64748B] text-right">Delta</TableHead>
              <TableHead className="text-[#64748B]">Nota</TableHead>
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
                <TableCell className="text-[#0F172A]">{tx.user}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    tx.delta > 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
                >
                  {tx.delta > 0 ? "+" : ""}
                  {tx.delta.toLocaleString("es-PE")}
                </TableCell>
                <TableCell className="text-[#94A3B8]">
                  {tx.note || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Plan card */}
      <Card className="border-[#E2E8F0]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0F172A]">Plan actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Plan:</span>
                <Badge className={getPlanBadgeVariant(org.plan)}>
                  {getPlanLabel(org.plan)}
                </Badge>
              </div>
              <p className="text-sm text-[#64748B]">
                Créditos mensuales:{" "}
                <span className="text-[#0F172A] font-medium">
                  {org.totalMonthlyCredits.toLocaleString("es-PE")}
                </span>
              </p>
              <p className="text-sm text-[#64748B]">
                Próxima renovación:{" "}
                <span className="text-[#0F172A] font-medium">
                  {formatDate(org.nextRenewal)}
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
            >
              Contactar para cambiar plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsTab({ org }: { org: Organization }) {
  const [name, setName] = useState(org.name)
  const [ruc, setRuc] = useState(org.ruc || "")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmName, setConfirmName] = useState("")

  const canDelete = confirmName === org.name

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Organization info */}
      <Card className="border-[#E2E8F0]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0F172A]">
            Información de la organización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-[#0F172A]">
              Nombre de la organización
            </Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-ruc" className="text-[#0F172A]">
              RUC
            </Label>
            <Input
              id="org-ruc"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              placeholder="20123456789"
              className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
            />
          </div>
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#0F172A]">
                Eliminar organización
              </p>
              <p className="text-sm text-[#64748B]">
                Esta acción es irreversible. Todos los datos serán eliminados.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Eliminar organización
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              ¿Estás seguro que deseas eliminar esta organización?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Esta acción es <strong>irreversible</strong>. Se eliminarán
                permanentemente:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Todos los casos y documentos</li>
                <li>Historial de consultas</li>
                <li>Créditos no utilizados</li>
                <li>Acceso de todos los miembros</li>
              </ul>
              <div className="pt-2">
                <Label htmlFor="confirm-name" className="text-[#0F172A]">
                  Escribe <strong>{org.name}</strong> para confirmar:
                </Label>
                <Input
                  id="confirm-name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={org.name}
                  className="mt-2 border-[#E2E8F0] focus-visible:ring-red-500"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#E2E8F0] text-[#64748B]"
              onClick={() => setConfirmName("")}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!canDelete}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Eliminar organización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const org = mockOrganization
  const isOwner = org.myRole === "owner"

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
        title={org.name}
        breadcrumb={[
          { label: "Organizaciones", href: "/app/organizations" },
          { label: org.name },
        ]}
        actions={
          <Button variant="ghost" asChild className="text-[#64748B]">
            <Link href="/app/organizations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="p-8">
        {/* Org header */}
        <Card className="border-[#E2E8F0] mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(org.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-[#0F172A]">
                      {org.name}
                    </h2>
                    <Badge className={getPlanBadgeVariant(org.plan)}>
                      {getPlanLabel(org.plan)}
                    </Badge>
                  </div>
                  {org.ruc && (
                    <p className="text-sm text-[#94A3B8]">RUC: {org.ruc}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-[#64748B]">Tu rol:</span>
                    <Badge className={getRoleBadgeVariant(org.myRole)}>
                      {getRoleLabel(org.myRole)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Miembros</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">
                    {org.membersCount}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">Casos</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">
                    {org.activeCasesCount}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Pool</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">
                    {org.poolCredits.toLocaleString("es-PE")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-[#F1F5F9] p-1">
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
            >
              Miembros
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
            >
              Créditos
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
              >
                Configuración
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members">
            <MembersTab
              members={mockMembers}
              myRole={org.myRole}
              poolCredits={org.poolCredits}
            />
          </TabsContent>

          <TabsContent value="credits">
            <CreditsTab org={org} />
          </TabsContent>

          {isOwner && (
            <TabsContent value="settings">
              <SettingsTab org={org} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  )
}
