"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  MessageSquare,
  MoreVertical,
  FileText,
  CheckCircle,
  Zap,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  ChevronRight,
  Pencil,
  Archive,
  ArrowRightLeft,
  FileDown,
  Building2,
  X,
  Search,
  Loader2,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenuSeparator,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Types
interface CaseData {
  id: string
  name: string
  expedientNumber?: string
  status: "active" | "archived"
  instance?: "sunat" | "tribunal" | "poder-judicial"
  organizationId?: string
  organizationName?: string
  description?: string
  docsCount: number
  docsReady: number
  queriesCount: number
  creditsConsumed: number
  createdBy: { id: string; name: string; email: string }
}

interface Document {
  id: string
  name: string
  size: number
  type: "expediente" | "escrito" | "resolucion" | "oficio" | "anexo" | "otro"
  status: "pending" | "processing" | "ready" | "error"
  errorMessage?: string
  pages?: number
  creditsIngesta: number
  uploadedBy: { id: string; name: string; avatarUrl?: string }
  uploadedAt: Date
  fileType: "pdf" | "docx" | "odt" | "txt" | "md"
}

interface Query {
  id: string
  question: string
  answer: string
  mode: "min" | "medium" | "advanced"
  user: { id: string; name: string; avatarUrl?: string }
  createdAt: Date
  inputTokens: number
  outputTokens: number
  credits: number
  sources: Array<{ documentName: string; page: number }>
}

interface CaseUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: "owner" | "admin" | "lawyer"
  canView: boolean
  canQuery: boolean
  canUpload: boolean
  grantedBy: string
  isCreator: boolean
}

// Mock data
const mockUser = {
  id: "user-1",
  name: "Carlos Mendoza",
  role: "admin" as const,
  credits: 42500,
  maxCredits: 50000,
}

const mockCase: CaseData = {
  id: "case-1",
  name: "Fiscalización SUNAT 2024 - IGV Importaciones",
  expedientNumber: "0123-2024-SUNAT/PIR",
  status: "active",
  instance: "sunat",
  organizationId: "org-1",
  organizationName: "Estudio Jurídico Mendoza",
  description: "Fiscalización iniciada en febrero 2024 por presuntas inconsistencias en declaraciones de IGV de importaciones.",
  docsCount: 12,
  docsReady: 10,
  queriesCount: 8,
  creditsConsumed: 3500,
  createdBy: { id: "user-1", name: "Carlos Mendoza", email: "carlos@estudio.pe" },
}

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Requerimiento SUNAT 2024-001.pdf",
    size: 2456789,
    type: "expediente",
    status: "ready",
    pages: 45,
    creditsIngesta: 450,
    uploadedBy: { id: "user-1", name: "Carlos Mendoza" },
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fileType: "pdf",
  },
  {
    id: "doc-2",
    name: "Respuesta a Requerimiento.docx",
    size: 1234567,
    type: "escrito",
    status: "ready",
    pages: 23,
    creditsIngesta: 230,
    uploadedBy: { id: "user-1", name: "Carlos Mendoza" },
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    fileType: "docx",
  },
  {
    id: "doc-3",
    name: "Resolución de Determinación.pdf",
    size: 3456789,
    type: "resolucion",
    status: "processing",
    creditsIngesta: 0,
    uploadedBy: { id: "user-2", name: "Ana López" },
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    fileType: "pdf",
  },
  {
    id: "doc-4",
    name: "Anexo - Declaraciones Juradas.pdf",
    size: 987654,
    type: "anexo",
    status: "error",
    errorMessage: "Error al procesar: archivo protegido con contraseña",
    creditsIngesta: 0,
    uploadedBy: { id: "user-1", name: "Carlos Mendoza" },
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    fileType: "pdf",
  },
  {
    id: "doc-5",
    name: "Oficio SUNAT 2024-002.pdf",
    size: 567890,
    type: "oficio",
    status: "pending",
    creditsIngesta: 0,
    uploadedBy: { id: "user-1", name: "Carlos Mendoza" },
    uploadedAt: new Date(Date.now() - 5 * 60 * 1000),
    fileType: "pdf",
  },
]

const mockQueries: Query[] = [
  {
    id: "query-1",
    question: "¿Cuáles son los principales argumentos de la SUNAT para la fiscalización?",
    answer: "Según el Requerimiento SUNAT 2024-001, los principales argumentos son: 1) Diferencias entre las declaraciones de IGV y los registros de importaciones de la SUNAT, específicamente en los periodos de enero a junio 2023. 2) Inconsistencias en los créditos fiscales declarados respecto a las facturas registradas en el sistema de la SUNAT. 3) Operaciones con proveedores que presentan irregularidades tributarias...",
    mode: "advanced",
    user: { id: "user-1", name: "Carlos Mendoza" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    inputTokens: 1250,
    outputTokens: 2340,
    credits: 450,
    sources: [
      { documentName: "Requerimiento SUNAT 2024-001.pdf", page: 3 },
      { documentName: "Requerimiento SUNAT 2024-001.pdf", page: 15 },
      { documentName: "Respuesta a Requerimiento.docx", page: 8 },
    ],
  },
  {
    id: "query-2",
    question: "¿Qué plazos tenemos para responder al requerimiento?",
    answer: "De acuerdo con el Requerimiento SUNAT 2024-001, el plazo para presentar la información solicitada es de 10 días hábiles contados desde la fecha de notificación. La notificación fue realizada el 15 de febrero de 2024, por lo que el plazo vence el 29 de febrero de 2024...",
    mode: "min",
    user: { id: "user-2", name: "Ana López" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    inputTokens: 450,
    outputTokens: 890,
    credits: 120,
    sources: [
      { documentName: "Requerimiento SUNAT 2024-001.pdf", page: 1 },
    ],
  },
  {
    id: "query-3",
    question: "Resume las inconsistencias identificadas por SUNAT en las importaciones",
    answer: "Las inconsistencias identificadas por SUNAT en las importaciones incluyen: diferencias en valores FOB declarados, discrepancias en partidas arancelarias, y falta de documentación de respaldo para algunas operaciones...",
    mode: "medium",
    user: { id: "user-1", name: "Carlos Mendoza" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    inputTokens: 780,
    outputTokens: 1560,
    credits: 280,
    sources: [
      { documentName: "Requerimiento SUNAT 2024-001.pdf", page: 12 },
      { documentName: "Requerimiento SUNAT 2024-001.pdf", page: 13 },
    ],
  },
]

const mockCaseUsers: CaseUser[] = [
  {
    id: "user-1",
    name: "Carlos Mendoza",
    email: "carlos@estudio.pe",
    role: "admin",
    canView: true,
    canQuery: true,
    canUpload: true,
    grantedBy: "Sistema",
    isCreator: true,
  },
  {
    id: "user-2",
    name: "Ana López",
    email: "ana@estudio.pe",
    avatarUrl: "",
    role: "lawyer",
    canView: true,
    canQuery: true,
    canUpload: true,
    grantedBy: "Carlos Mendoza",
    isCreator: false,
  },
  {
    id: "user-3",
    name: "Pedro García",
    email: "pedro@estudio.pe",
    role: "lawyer",
    canView: true,
    canQuery: true,
    canUpload: false,
    grantedBy: "Carlos Mendoza",
    isCreator: false,
  },
]

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "ahora"
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays === 1) return "ayer"
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
}

function getFileIcon(fileType: Document["fileType"]) {
  const colors: Record<Document["fileType"], string> = {
    pdf: "text-red-500",
    docx: "text-blue-500",
    odt: "text-green-500",
    txt: "text-gray-500",
    md: "text-purple-500",
  }
  return <FileText className={cn("h-5 w-5", colors[fileType])} />
}

function getDocTypeLabel(type: Document["type"]) {
  const labels: Record<Document["type"], string> = {
    expediente: "Expediente",
    escrito: "Escrito",
    resolucion: "Resolución",
    oficio: "Oficio",
    anexo: "Anexo",
    otro: "Otro",
  }
  return labels[type]
}

function getDocTypeBadgeColor(type: Document["type"]) {
  const colors: Record<Document["type"], string> = {
    expediente: "bg-[#1E3A5F] text-white",
    escrito: "bg-[#EFF6FF] text-[#2563EB]",
    resolucion: "bg-[#F5F3FF] text-[#7C3AED]",
    oficio: "bg-[#FFF7ED] text-[#EA580C]",
    anexo: "bg-[#F0FDF4] text-[#16A34A]",
    otro: "bg-[#F1F5F9] text-[#64748B]",
  }
  return colors[type]
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// Document Status Badge with animation
function DocumentStatusBadge({ status, errorMessage }: { status: Document["status"]; errorMessage?: string }) {
  const config = {
    pending: { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", label: "En espera", pulse: false },
    processing: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Procesando...", pulse: true },
    ready: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Listo", pulse: false },
    error: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", label: "Error", pulse: false },
  }

  const c = config[status]

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        c.bg,
        c.text,
        c.pulse && "animate-pulse"
      )}
    >
      {status === "pending" && (
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {status === "processing" && (
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {status === "ready" && <CheckCircle className="h-3 w-3" />}
      {status === "error" && <AlertCircle className="h-3 w-3" />}
      {c.label}
    </span>
  )

  if (status === "error" && errorMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[200px] text-xs">{errorMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}

// Main Component
export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params?.id as string

  // State
  const [activeTab, setActiveTab] = useState("documents")
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [queries] = useState<Query[]>(mockQueries)
  const [caseUsers, setCaseUsers] = useState<CaseUser[]>(mockCaseUsers)

  // Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadDocType, setUploadDocType] = useState<Document["type"]>("expediente")
  const [uploading, setUploading] = useState(false)

  // Query filters
  const [queryUserFilter, setQueryUserFilter] = useState("all")
  const [queryModeFilter, setQueryModeFilter] = useState("all")
  const [queryPage, setQueryPage] = useState(1)
  const queriesPerPage = 20

  // Access tab state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteSearch, setInviteSearch] = useState("")
  const [invitePermissions, setInvitePermissions] = useState({ view: true, query: false, upload: false })
  const [inviteLoading, setInviteLoading] = useState(false)

  // Case is current user the creator or admin
  const canManageAccess = mockUser.role === "admin" || mockUser.role === "owner" || mockCase.createdBy.id === mockUser.id

  // Filter queries
  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      if (queryUserFilter !== "all" && q.user.id !== queryUserFilter) return false
      if (queryModeFilter !== "all" && q.mode !== queryModeFilter) return false
      return true
    })
  }, [queries, queryUserFilter, queryModeFilter])

  const paginatedQueries = filteredQueries.slice(0, queryPage * queriesPerPage)
  const hasMoreQueries = paginatedQueries.length < filteredQueries.length

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFileUpload(files)
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    setUploading(true)

    // Simulate upload - add new documents with pending status
    const newDocs: Document[] = files.map((file, index) => ({
      id: `doc-new-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: uploadDocType,
      status: "pending" as const,
      creditsIngesta: 0,
      uploadedBy: { id: mockUser.id, name: mockUser.name },
      uploadedAt: new Date(),
      fileType: file.name.endsWith(".pdf") ? "pdf" as const : 
                file.name.endsWith(".docx") ? "docx" as const : 
                file.name.endsWith(".odt") ? "odt" as const : 
                file.name.endsWith(".md") ? "md" as const : "txt" as const,
    }))

    setDocuments(prev => [...newDocs, ...prev])
    setUploading(false)

    // Simulate processing status updates
    newDocs.forEach((doc, index) => {
      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: "processing" as const } : d
        ))
      }, 1000 + index * 500)

      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: "ready" as const, pages: Math.floor(Math.random() * 50) + 5, creditsIngesta: Math.floor(Math.random() * 500) + 100 } : d
        ))
      }, 4000 + index * 1000)
    })
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  const handleInviteUser = async () => {
    if (!inviteSearch) return
    setInviteLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setInviteLoading(false)
    setInviteDialogOpen(false)
    setInviteSearch("")
    setInvitePermissions({ view: true, query: false, upload: false })
  }

  const handleRevokeAccess = (userId: string) => {
    setCaseUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleUpdatePermission = (userId: string, permission: "canView" | "canQuery" | "canUpload", value: boolean) => {
    setCaseUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, [permission]: value } : u
    ))
  }

  // Unique users for query filter
  const uniqueQueryUsers = useMemo(() => {
    const users = new Map<string, { id: string; name: string }>()
    queries.forEach(q => users.set(q.user.id, q.user))
    return Array.from(users.values())
  }, [queries])

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
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0]">
        <div className="px-8 py-4">
          {/* Row 1: Breadcrumb and badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <nav className="flex items-center text-sm text-[#64748B]">
              <Link href="/app/cases" className="hover:text-[#2563EB]">Casos</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{mockCase.name}</span>
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              <StatusBadge type={mockCase.status} />
              {mockCase.instance && <StatusBadge type={mockCase.instance} />}
              {mockCase.organizationName ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB]">
                  <Building2 className="h-3 w-3" />
                  {mockCase.organizationName}
                </span>
              ) : (
                <StatusBadge type="personal" />
              )}
            </div>
          </div>

          {/* Row 2: Title and actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0F172A]">{mockCase.name}</h1>
              {mockCase.expedientNumber && (
                <p className="text-sm font-mono text-[#64748B] mt-0.5">{mockCase.expedientNumber}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => router.push(`/app/cases/${caseId}/chat`)}
                className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Consultar expediente
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-[#E2E8F0]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar caso
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    {mockCase.status === "archived" ? "Reactivar" : "Archivar"}
                  </DropdownMenuItem>
                  {!mockCase.organizationId && (
                    <DropdownMenuItem>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Migrar a organización
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar historial CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="px-8 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div className="flex items-center gap-6 text-sm text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-[#0F172A]">{mockCase.docsCount}</span> documentos
            </span>
            <span className="text-[#E2E8F0]">|</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-[#16A34A]" />
              <span className="font-medium text-[#0F172A]">{mockCase.docsReady}</span> listos
            </span>
            <span className="text-[#E2E8F0]">|</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium text-[#0F172A]">{mockCase.queriesCount}</span> consultas
            </span>
            <span className="text-[#E2E8F0]">|</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#D97706]" />
              <span className="font-medium text-[#0F172A]">{mockCase.creditsConsumed.toLocaleString("es-PE")}</span> créditos consumidos
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#F1F5F9] p-1">
            <TabsTrigger value="documents" className="data-[state=active]:bg-white">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="queries" className="data-[state=active]:bg-white">
              Historial de consultas
            </TabsTrigger>
            {canManageAccess && (
              <TabsTrigger value="access" className="data-[state=active]:bg-white">
                Acceso
              </TabsTrigger>
            )}
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            {/* Upload zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6",
                isDragging
                  ? "border-[#2563EB] bg-[#EFF6FF]"
                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={cn("h-10 w-10 mx-auto mb-3", isDragging ? "text-[#2563EB]" : "text-[#94A3B8]")} />
              <p className="text-[#0F172A] font-medium mb-1">Arrastra documentos aquí</p>
              <p className="text-sm text-[#64748B] mb-4">PDF, Word, ODT, TXT, MD — máx. 20MB por archivo</p>
              <div className="flex items-center justify-center gap-3">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.odt,.txt,.md"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={uploading}
                  className="border-[#E2E8F0]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Seleccionar archivos"
                  )}
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Label htmlFor="doc-type" className="text-sm text-[#64748B]">Tipo de documento:</Label>
                <Select value={uploadDocType} onValueChange={(v) => setUploadDocType(v as Document["type"])}>
                  <SelectTrigger id="doc-type" className="w-40 border-[#E2E8F0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expediente">Expediente</SelectItem>
                    <SelectItem value="escrito">Escrito</SelectItem>
                    <SelectItem value="resolucion">Resolución</SelectItem>
                    <SelectItem value="oficio">Oficio</SelectItem>
                    <SelectItem value="anexo">Anexo</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Documents table */}
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Sin documentos"
                description="Sube el primer documento del expediente para empezar"
                action={{ label: "Subir documento", onClick: () => document.getElementById("file-upload")?.click() }}
              />
            ) : (
              <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC]">
                      <TableHead>Archivo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Páginas</TableHead>
                      <TableHead className="text-right">Créditos ingesta</TableHead>
                      <TableHead>Subido por</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.fileType)}
                            <div>
                              <p className="font-medium text-[#0F172A] max-w-[200px] truncate">{doc.name}</p>
                              <p className="text-xs text-[#64748B]">{formatFileSize(doc.size)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            getDocTypeBadgeColor(doc.type)
                          )}>
                            {getDocTypeLabel(doc.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DocumentStatusBadge status={doc.status} errorMessage={doc.errorMessage} />
                        </TableCell>
                        <TableCell className="text-right text-[#64748B]">
                          {doc.pages ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-[#64748B]">
                          {doc.creditsIngesta > 0 ? doc.creditsIngesta.toLocaleString("es-PE") : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={doc.uploadedBy.avatarUrl} />
                              <AvatarFallback className="text-xs bg-[#1E3A5F] text-white">
                                {getInitials(doc.uploadedBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[#64748B]">{doc.uploadedBy.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {formatRelativeDate(doc.uploadedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#64748B] hover:text-[#DC2626]"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Queries Tab */}
          <TabsContent value="queries" className="mt-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Select value={queryUserFilter} onValueChange={setQueryUserFilter}>
                <SelectTrigger className="w-48 border-[#E2E8F0]">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {uniqueQueryUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={queryModeFilter} onValueChange={setQueryModeFilter}>
                <SelectTrigger className="w-40 border-[#E2E8F0]">
                  <SelectValue placeholder="Todos los modos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los modos</SelectItem>
                  <SelectItem value="min">Mínimo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Query list */}
            {filteredQueries.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Sin consultas"
                description="Aún no se han realizado consultas en este caso"
                action={{ label: "Hacer primera consulta", onClick: () => router.push(`/app/cases/${caseId}/chat`) }}
              />
            ) : (
              <div className="space-y-4">
                {paginatedQueries.map(query => (
                  <Card key={query.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={query.user.avatarUrl} />
                            <AvatarFallback className="text-xs bg-[#1E3A5F] text-white">
                              {getInitials(query.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-[#0F172A]">{query.user.name}</span>
                            <span className="mx-2 text-[#E2E8F0]">·</span>
                            <StatusBadge type={query.mode} />
                          </div>
                        </div>
                        <span className="text-sm text-[#64748B]">{formatRelativeDate(query.createdAt)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-semibold text-[#0F172A]">{query.question}</p>
                      <p className="text-[#64748B] line-clamp-3">{query.answer}</p>
                      <button className="text-sm text-[#2563EB] hover:underline">Ver completa →</button>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {query.sources.slice(0, 3).map((source, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F5F9] text-xs text-[#64748B]">
                            <FileText className="h-3 w-3" />
                            {source.documentName.length > 20 ? source.documentName.slice(0, 20) + "..." : source.documentName}
                            <span className="text-[#94A3B8]">p.{source.page}</span>
                          </span>
                        ))}
                        {query.sources.length > 3 && (
                          <span className="text-xs text-[#64748B]">+{query.sources.length - 3} más</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#94A3B8]">
                          ↑ {query.inputTokens.toLocaleString()} input · ↓ {query.outputTokens.toLocaleString()} output · {query.credits} créditos
                        </span>
                        <Button variant="ghost" size="sm" className="text-[#64748B] h-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {hasMoreQueries && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setQueryPage(p => p + 1)}
                      className="border-[#E2E8F0]"
                    >
                      Cargar más consultas
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Access Tab */}
          {canManageAccess && (
            <TabsContent value="access" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">Usuarios con acceso</h3>
                <Button
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
                >
                  Invitar usuario al caso
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC]">
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol en org</TableHead>
                      <TableHead className="text-center">Ver</TableHead>
                      <TableHead className="text-center">Consultar</TableHead>
                      <TableHead className="text-center">Subir</TableHead>
                      <TableHead>Concedido por</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="text-xs bg-[#1E3A5F] text-white">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#0F172A]">{user.name}</span>
                                {user.isCreator && (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#1E3A5F] text-white">
                                    Creador
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#64748B]">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge type={user.role} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.canView}
                            onCheckedChange={(v) => handleUpdatePermission(user.id, "canView", v)}
                            disabled={user.isCreator}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.canQuery}
                            onCheckedChange={(v) => handleUpdatePermission(user.id, "canQuery", v)}
                            disabled={user.isCreator}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.canUpload}
                            onCheckedChange={(v) => handleUpdatePermission(user.id, "canUpload", v)}
                            disabled={user.isCreator}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {user.grantedBy}
                        </TableCell>
                        <TableCell>
                          {!user.isCreator && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                              onClick={() => handleRevokeAccess(user.id)}
                            >
                              Revocar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invite Dialog */}
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invitar usuario al caso</DialogTitle>
                    <DialogDescription>
                      Busca por nombre o email. Solo usuarios de la misma organización.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                      <Input
                        placeholder="Buscar usuario..."
                        value={inviteSearch}
                        onChange={(e) => setInviteSearch(e.target.value)}
                        className="pl-9 border-[#E2E8F0]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Permisos</Label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={invitePermissions.view}
                            onChange={(e) => setInvitePermissions(p => ({ ...p, view: e.target.checked }))}
                            className="rounded border-[#E2E8F0]"
                          />
                          <span className="text-sm">Ver documentos</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={invitePermissions.query}
                            onChange={(e) => setInvitePermissions(p => ({ ...p, query: e.target.checked }))}
                            className="rounded border-[#E2E8F0]"
                          />
                          <span className="text-sm">Realizar consultas</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={invitePermissions.upload}
                            onChange={(e) => setInvitePermissions(p => ({ ...p, upload: e.target.checked }))}
                            className="rounded border-[#E2E8F0]"
                          />
                          <span className="text-sm">Subir documentos</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                      className="border-[#E2E8F0]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleInviteUser}
                      disabled={!inviteSearch || inviteLoading}
                      className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
                    >
                      {inviteLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Concediendo...
                        </>
                      ) : (
                        "Conceder acceso"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  )
}
