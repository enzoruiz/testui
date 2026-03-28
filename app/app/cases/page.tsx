"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  FileText,
  MessageSquare,
  Calendar,
  MoreVertical,
  FolderOpen,
  Pencil,
  Archive,
  ArrowRightLeft,
  X,
  HelpCircle,
  Building2,
  Loader2,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Types
interface Case {
  id: string
  name: string
  expedientNumber?: string
  status: "active" | "archived"
  instance?: "sunat" | "tribunal" | "poder-judicial"
  organizationId?: string
  organizationName?: string
  docsCount: number
  hasDocError: boolean
  queriesCount: number
  lastQueryDate?: Date
  creditsConsumed: number
  maxCredits: number
}

interface Organization {
  id: string
  name: string
}

// Mock data
const mockUser = {
  name: "Carlos Mendoza",
  role: "admin" as const,
  credits: 42500,
  maxCredits: 50000,
}

const mockOrganizations: Organization[] = [
  { id: "org-1", name: "Estudio Jurídico Mendoza" },
  { id: "org-2", name: "Consultores Tributarios SAC" },
]

const mockCases: Case[] = [
  {
    id: "case-1",
    name: "Fiscalización SUNAT 2024 - IGV Importaciones",
    expedientNumber: "0123-2024-SUNAT/PIR",
    status: "active",
    instance: "sunat",
    organizationId: "org-1",
    organizationName: "Estudio Jurídico Mendoza",
    docsCount: 12,
    hasDocError: false,
    queriesCount: 8,
    lastQueryDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    creditsConsumed: 3500,
    maxCredits: 10000,
  },
  {
    id: "case-2",
    name: "Apelación Tribunal Fiscal - Multas IGV 2023",
    expedientNumber: "04521-2023-TF",
    status: "active",
    instance: "tribunal",
    organizationId: "org-1",
    organizationName: "Estudio Jurídico Mendoza",
    docsCount: 24,
    hasDocError: true,
    queriesCount: 15,
    lastQueryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    creditsConsumed: 7200,
    maxCredits: 10000,
  },
  {
    id: "case-3",
    name: "Demanda Contenciosa - Renta 2022",
    expedientNumber: "01234-2023-0-1801-JR-CA-01",
    status: "active",
    instance: "poder-judicial",
    docsCount: 8,
    hasDocError: false,
    queriesCount: 3,
    lastQueryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    creditsConsumed: 1200,
    maxCredits: 10000,
  },
  {
    id: "case-4",
    name: "Cobranza Coactiva SUNAT - Deuda IR",
    status: "archived",
    instance: "sunat",
    docsCount: 5,
    hasDocError: false,
    queriesCount: 2,
    lastQueryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    creditsConsumed: 800,
    maxCredits: 10000,
  },
  {
    id: "case-5",
    name: "Revisión de Declaraciones Juradas 2021",
    status: "active",
    docsCount: 0,
    hasDocError: false,
    queriesCount: 0,
    creditsConsumed: 0,
    maxCredits: 10000,
  },
]

// Helper functions
function formatRelativeDate(date?: Date): string {
  if (!date) return "Sin consultas"
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays === 1) return "ayer"
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`
  return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? "es" : ""}`
}

// Case Card Component
function CaseCard({
  caseData,
  onOpen,
  onEdit,
  onArchive,
  onMigrate,
  canMigrate,
}: {
  caseData: Case
  onOpen: () => void
  onEdit: () => void
  onArchive: () => void
  onMigrate: () => void
  canMigrate: boolean
}) {
  const creditsPercentage = caseData.maxCredits > 0 
    ? (caseData.creditsConsumed / caseData.maxCredits) * 100 
    : 0

  return (
    <Card 
      className="flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
      onClick={(e) => {
        // Don't navigate if clicking on interactive elements
        if ((e.target as HTMLElement).closest("button, [role='menuitem']")) return
        onOpen()
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge type={caseData.status} />
          {caseData.instance && <StatusBadge type={caseData.instance} />}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#2563EB] transition-colors">
          {caseData.name}
        </h3>
        
        {/* Expedient number */}
        {caseData.expedientNumber && (
          <p className="text-xs font-mono text-[#64748B]">
            {caseData.expedientNumber}
          </p>
        )}
        
        {/* Organization badge */}
        {caseData.organizationName ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB]">
            <Building2 className="h-3 w-3" />
            {caseData.organizationName}
          </span>
        ) : (
          <StatusBadge type="personal" />
        )}
        
        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <FileText className={cn("h-3.5 w-3.5", caseData.hasDocError && "text-[#DC2626]")} />
            <span className={caseData.hasDocError ? "text-[#DC2626] font-medium" : ""}>
              {caseData.docsCount} docs
            </span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {caseData.queriesCount} consultas
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatRelativeDate(caseData.lastQueryDate)}
          </span>
        </div>
        
        {/* Credits progress */}
        <div className="space-y-1">
          <Progress 
            value={creditsPercentage} 
            className="h-1.5 bg-[#E2E8F0]"
          />
          <p className="text-xs text-[#64748B]">
            {caseData.creditsConsumed.toLocaleString("es-PE")} créditos consumidos
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 gap-2">
        <Button 
          variant="outline" 
          className="flex-1 border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          Abrir caso
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {caseData.status === "archived" ? "Reactivar" : "Archivar"}
            </DropdownMenuItem>
            {canMigrate && !caseData.organizationId && (
              <DropdownMenuItem onClick={onMigrate}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Migrar a organización
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

// Create Case Sheet Component
function CreateCaseSheet({
  open,
  onOpenChange,
  organizations,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: Organization[]
  onSuccess: (caseId: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    expedientNumber: "",
    instance: "",
    organizationId: "",
    description: "",
  })

  const isValid = formData.name.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newCaseId = `case-${Date.now()}`
    setLoading(false)
    onOpenChange(false)
    
    // Reset form
    setFormData({
      name: "",
      expedientNumber: "",
      instance: "",
      organizationId: "",
      description: "",
    })
    
    onSuccess(newCaseId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-[#0F172A]">Nuevo expediente</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col mt-6">
          <div className="flex-1 space-y-6">
            {/* Case name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#0F172A]">
                Nombre del caso <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Fiscalización SUNAT 2024 - IGV"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 255) })}
                className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
              />
              <p className="text-xs text-[#64748B] text-right">
                {formData.name.length}/255
              </p>
            </div>
            
            {/* Expedient number */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="expedientNumber" className="text-[#0F172A]">
                  Número de expediente
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-[#94A3B8] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>El número oficial del expediente en la instancia correspondiente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="expedientNumber"
                placeholder="Ej: 0123-2024-SUNAT/PIR"
                value={formData.expedientNumber}
                onChange={(e) => setFormData({ ...formData, expedientNumber: e.target.value })}
                className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB] font-mono"
              />
            </div>
            
            {/* Instance select */}
            <div className="space-y-2">
              <Label className="text-[#0F172A]">Instancia</Label>
              <Select
                value={formData.instance}
                onValueChange={(value) => setFormData({ ...formData, instance: value })}
              >
                <SelectTrigger className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]">
                  <SelectValue placeholder="— Sin especificar —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Sin especificar —</SelectItem>
                  <SelectItem value="sunat">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                      SUNAT
                    </span>
                  </SelectItem>
                  <SelectItem value="tribunal">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                      Tribunal Fiscal
                    </span>
                  </SelectItem>
                  <SelectItem value="poder-judicial">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                      Poder Judicial
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Organization select - only if user has organizations */}
            {organizations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[#0F172A]">Organización</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                >
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]">
                    <SelectValue placeholder="Personal (solo visible para mí)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal (solo visible para mí)</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.organizationId && formData.organizationId !== "personal" && (
                  <p className="text-xs text-[#64748B] bg-[#F8FAFC] p-2 rounded">
                    Los miembros con acceso al caso podrán ver los documentos
                  </p>
                )}
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#0F172A]">
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del caso, partes involucradas, situación actual..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB] min-h-[100px] resize-none"
              />
              <p className="text-xs text-[#64748B] text-right">
                {formData.description.length}/500
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E2E8F0] mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#E2E8F0] text-[#0F172A]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear expediente"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Main Cases Page Component
export default function CasesPage() {
  const router = useRouter()
  
  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [orgFilter, setOrgFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [instanceFilter, setInstanceFilter] = useState("all")
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [migrateTargetOrg, setMigrateTargetOrg] = useState("")
  const [visibleCount, setVisibleCount] = useState(6)

  // Filtered cases
  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = c.name.toLowerCase().includes(query)
        const matchesExpedient = c.expedientNumber?.toLowerCase().includes(query)
        if (!matchesName && !matchesExpedient) return false
      }

      // Organization filter
      if (orgFilter !== "all") {
        if (orgFilter === "personal" && c.organizationId) return false
        if (orgFilter !== "personal" && c.organizationId !== orgFilter) return false
      }

      // Status filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false

      // Instance filter
      if (instanceFilter !== "all" && c.instance !== instanceFilter) return false

      return true
    })
  }, [searchQuery, orgFilter, statusFilter, instanceFilter])

  const visibleCases = filteredCases.slice(0, visibleCount)
  const hasMore = visibleCount < filteredCases.length

  const handleCreateSuccess = (caseId: string) => {
    // Show toast would go here
    router.push(`/app/cases/${caseId}`)
  }

  const handleArchive = () => {
    // API call would go here
    setArchiveDialogOpen(false)
    setSelectedCase(null)
  }

  const handleMigrate = () => {
    // API call would go here
    setMigrateDialogOpen(false)
    setSelectedCase(null)
    setMigrateTargetOrg("")
  }

  return (
    <AppLayout
      currentPath="/app/cases"
      creditProps={{
        userName: mockUser.name,
        userRole: mockUser.role,
        availableCredits: mockUser.credits,
        totalCredits: mockUser.maxCredits,
        onLogout: () => router.push("/auth/login"),
      }}
    >
      <PageHeader
        title="Casos"
        breadcrumb={[{ label: "Casos" }]}
        actions={
          <Button
            onClick={() => setCreateSheetOpen(true)}
            className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo caso
          </Button>
        }
      />

      <div className="p-8">
        {/* Filters bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <Input
              placeholder="Buscar por nombre o número de expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-[180px] border-[#E2E8F0]">
                <SelectValue placeholder="Organización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                {mockOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-[#E2E8F0]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={instanceFilter} onValueChange={setInstanceFilter}>
              <SelectTrigger className="w-[160px] border-[#E2E8F0]">
                <SelectValue placeholder="Instancia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="sunat">SUNAT</SelectItem>
                <SelectItem value="tribunal">Tribunal Fiscal</SelectItem>
                <SelectItem value="poder-judicial">Poder Judicial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cases grid or empty state */}
        {filteredCases.length === 0 ? (
          mockCases.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Crea tu primer caso"
              description="Empieza creando un expediente para subir documentos y realizar consultas con IA."
              action={{
                label: "Crear caso",
                onClick: () => setCreateSheetOpen(true),
              }}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No se encontraron casos"
              description="No hay casos que coincidan con los filtros seleccionados. Intenta con otros criterios."
            />
          )
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCases.map((caseData) => (
                <CaseCard
                  key={caseData.id}
                  caseData={caseData}
                  onOpen={() => router.push(`/app/cases/${caseData.id}`)}
                  onEdit={() => router.push(`/app/cases/${caseData.id}/edit`)}
                  onArchive={() => {
                    setSelectedCase(caseData)
                    setArchiveDialogOpen(true)
                  }}
                  onMigrate={() => {
                    setSelectedCase(caseData)
                    setMigrateDialogOpen(true)
                  }}
                  canMigrate={mockOrganizations.length > 0}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="border-[#E2E8F0] text-[#0F172A]"
                >
                  Cargar más ({filteredCases.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Case Sheet */}
      <CreateCaseSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        organizations={mockOrganizations}
        onSuccess={handleCreateSuccess}
      />

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCase?.status === "archived" ? "Reactivar caso" : "Archivar caso"}
            </DialogTitle>
            <DialogDescription>
              {selectedCase?.status === "archived"
                ? `¿Estás seguro de que deseas reactivar "${selectedCase?.name}"? El caso volverá a aparecer en tu lista activa.`
                : `¿Estás seguro de que deseas archivar "${selectedCase?.name}"? Podrás reactivarlo en cualquier momento.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleArchive}
              className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
            >
              {selectedCase?.status === "archived" ? "Reactivar" : "Archivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migrate to Organization Dialog */}
      <Dialog open={migrateDialogOpen} onOpenChange={setMigrateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrar a organización</DialogTitle>
            <DialogDescription>
              Selecciona la organización a la que deseas migrar el caso &quot;{selectedCase?.name}&quot;.
              Los miembros de la organización podrán ver los documentos del caso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={migrateTargetOrg} onValueChange={setMigrateTargetOrg}>
              <SelectTrigger className="border-[#E2E8F0]">
                <SelectValue placeholder="Selecciona una organización" />
              </SelectTrigger>
              <SelectContent>
                {mockOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMigrateDialogOpen(false)
                setMigrateTargetOrg("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMigrate}
              disabled={!migrateTargetOrg}
              className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
            >
              Migrar caso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
