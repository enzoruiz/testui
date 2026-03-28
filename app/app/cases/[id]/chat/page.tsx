"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Scale,
  FileText,
  Send,
  Square,
  RefreshCw,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  Search,
  AlertTriangle,
  Zap,
  ChevronLeft,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Files,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// Types
type DocumentStatus = "ready" | "processing" | "error" | "pending"
type DocumentType = "resolucion" | "escrito" | "anexo" | "contrato" | "sentencia" | "dictamen"
type QueryMode = "min" | "medium" | "advanced"

interface CaseDocument {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  pages?: number
}

interface SourceReference {
  documentId: string
  documentName: string
  pages: string
  score: number
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  mode?: QueryMode
  sources?: SourceReference[]
  metrics?: {
    inputTokens: number
    outputTokens: number
    creditsConsumed: number
    latencyMs: number
  }
  isNoMatch?: boolean
}

interface CaseData {
  id: string
  title: string
  expedientNumber: string
  documents: CaseDocument[]
}

// Mock data
const mockCase: CaseData = {
  id: "1",
  title: "Recurso de Apelación - Impuesto a la Renta 2022",
  expedientNumber: "2024-001234-0-1801-JR-CA-01",
  documents: [
    { id: "d1", name: "resolucion_determinacion_2024.pdf", type: "resolucion", status: "ready", pages: 12 },
    { id: "d2", name: "escrito_de_apelacion.pdf", type: "escrito", status: "ready", pages: 8 },
    { id: "d3", name: "anexos_probatorios.pdf", type: "anexo", status: "ready", pages: 45 },
    { id: "d4", name: "contrato_servicios.pdf", type: "contrato", status: "processing" },
    { id: "d5", name: "dictamen_pericial.pdf", type: "dictamen", status: "error" },
  ],
}

const mockInitialMessages: ChatMessage[] = []

const exampleQuestions = [
  "¿Cuál es el monto de la deuda tributaria?",
  "¿Qué argumentos presenta el contribuyente?",
  "¿Cuáles son los plazos establecidos en la resolución?",
]

const modeConfig: Record<QueryMode, { label: string; shortLabel: string; description: string; credits: number; color: string }> = {
  min: { label: "Min", shortLabel: "Min", description: "GPT-4o mini · Más económico", credits: 7000, color: "bg-[#16A34A]" },
  medium: { label: "Medium", shortLabel: "Med", description: "GPT-4o · Balance costo/calidad", credits: 7200, color: "bg-[#D97706]" },
  advanced: { label: "Advanced", shortLabel: "Adv", description: "Claude Sonnet · Máximo razonamiento", credits: 7500, color: "bg-[#DC2626]" },
}

const documentTypeLabels: Record<DocumentType, string> = {
  resolucion: "Resolución",
  escrito: "Escrito",
  anexo: "Anexo",
  contrato: "Contrato",
  sentencia: "Sentencia",
  dictamen: "Dictamen",
}

// Simulated streaming response
const simulatedResponse = `La deuda tributaria determinada según la **Resolución de Determinación N° 024-003-0012345** asciende a un total de **S/ 245,678.00** (Doscientos Cuarenta y Cinco Mil Seiscientos Setenta y Ocho con 00/100 Soles).

Este monto se compone de:

1. **Tributo omitido**: S/ 180,000.00
2. **Intereses moratorios**: S/ 45,678.00
3. **Multas por infracciones**: S/ 20,000.00

El periodo fiscalizado corresponde al ejercicio fiscal 2022, específicamente los meses de enero a diciembre.`

export default function ChatPage() {
  const params = useParams()
  const caseId = params.id as string

  // State
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialMessages)
  const [inputValue, setInputValue] = useState("")
  const [selectedMode, setSelectedMode] = useState<QueryMode>("min")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [availableCredits, setAvailableCredits] = useState(125000)
  const [highlightedDocId, setHighlightedDocId] = useState<string | null>(null)
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Computed values
  const readyDocuments = mockCase.documents.filter((d) => d.status === "ready")
  const processingDocuments = mockCase.documents.filter((d) => d.status === "processing")
  const errorDocuments = mockCase.documents.filter((d) => d.status === "error")
  const hasReadyDocuments = readyDocuments.length > 0
  const isOutOfCredits = availableCredits === 0
  const estimatedCredits = modeConfig[selectedMode].credits
  const insufficientCredits = availableCredits < estimatedCredits

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }

  // Simulate streaming response
  const simulateStreaming = useCallback(async (userMessage: string) => {
    setIsStreaming(true)
    setStreamingContent("")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Stream tokens one by one
    let currentContent = ""
    for (let i = 0; i < simulatedResponse.length; i++) {
      currentContent += simulatedResponse[i]
      setStreamingContent(currentContent)
      await new Promise((resolve) => setTimeout(resolve, 15))
    }

    // Complete the message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: simulatedResponse,
      timestamp: new Date(),
      mode: selectedMode,
      sources: [
        { documentId: "d1", documentName: "resolucion_determinacion_2024.pdf", pages: "3-5", score: 0.92 },
        { documentId: "d2", documentName: "escrito_de_apelacion.pdf", pages: "1-2", score: 0.78 },
      ],
      metrics: {
        inputTokens: 1245,
        outputTokens: 387,
        creditsConsumed: modeConfig[selectedMode].credits,
        latencyMs: 2340,
      },
    }

    setMessages((prev) => [...prev, newMessage])
    setStreamingContent("")
    setIsStreaming(false)
    setAvailableCredits((prev) => Math.max(0, prev - modeConfig[selectedMode].credits))
  }, [selectedMode])

  // Send message
  const handleSend = () => {
    if (!inputValue.trim() || isStreaming || isOutOfCredits || !hasReadyDocuments) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    simulateStreaming(inputValue.trim())
  }

  // Handle example click
  const handleExampleClick = (question: string) => {
    setInputValue(question)
    textareaRef.current?.focus()
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Cancel streaming
  const handleCancelStream = () => {
    setIsStreaming(false)
    setStreamingContent("")
  }

  // New conversation
  const handleNewConversation = () => {
    setMessages([])
    setStreamingContent("")
    setIsStreaming(false)
  }

  // Copy response
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  // Highlight document
  const handleSourceClick = (docId: string) => {
    setHighlightedDocId(docId)
    setTimeout(() => setHighlightedDocId(null), 2000)
  }

  // Render markdown-like content (simplified)
  const renderContent = (content: string) => {
    // Split by bold markers
    const parts = content.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      // Handle line breaks and lists
      return part.split("\n").map((line, j) => {
        if (line.match(/^\d+\.\s/)) {
          return (
            <div key={`${i}-${j}`} className="ml-4">
              {line}
            </div>
          )
        }
        return (
          <span key={`${i}-${j}`}>
            {line}
            {j < part.split("\n").length - 1 && <br />}
          </span>
        )
      })
    })
  }

  // Document sidebar content
  const DocumentsSidebar = () => (
    <div className="h-full flex flex-col bg-[#F8FAFC] border-l border-[#E2E8F0]">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-[#64748B]" />
          <span className="text-sm font-semibold text-[#0F172A]">Documentos del expediente</span>
        </div>
        <Link
          href={`/app/cases/${caseId}`}
          className="inline-flex items-center gap-1 text-sm text-[#2563EB] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al caso
        </Link>
      </div>

      {/* Documents list */}
      <ScrollArea className="flex-1 p-4">
        {/* Ready documents */}
        {readyDocuments.length > 0 && (
          <div className="space-y-2">
            {readyDocuments.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "p-3 rounded-lg border bg-white transition-all cursor-pointer",
                  highlightedDocId === doc.id
                    ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                )}
                onClick={() => setHighlightedDocId(doc.id)}
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]">
                        {documentTypeLabels[doc.type]}
                      </Badge>
                      <StatusBadge type="ready" className="h-5 text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processing documents */}
        {processingDocuments.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-[#64748B] mb-2 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Procesando...
            </p>
            <div className="space-y-2">
              {processingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-[#E2E8F0] bg-white/50"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-[#94A3B8] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#64748B] truncate">{doc.name}</p>
                      <StatusBadge type="processing" className="mt-1 h-5 text-[10px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error documents */}
        {errorDocuments.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-[#DC2626] mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Con error
            </p>
            <div className="space-y-2">
              {errorDocuments.map((doc) => (
                <TooltipProvider key={doc.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2]">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-[#DC2626] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#DC2626] truncate">{doc.name}</p>
                            <StatusBadge type="error" className="mt-1 h-5 text-[10px]" />
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Error al procesar el documento. Intenta subirlo nuevamente.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Credit widget */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <Separator className="mb-4" />
        <div className={cn(
          "p-3 rounded-lg",
          isOutOfCredits ? "bg-[#FEF2F2]" : "bg-white border border-[#E2E8F0]"
        )}>
          <p className="text-xs text-[#64748B] mb-1">Saldo de créditos</p>
          <p className={cn(
            "text-xl font-semibold",
            isOutOfCredits ? "text-[#DC2626]" : "text-[#0F172A]"
          )}>
            {availableCredits.toLocaleString("es-PE")}
          </p>
          <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] mt-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOutOfCredits ? "bg-[#DC2626]" : "bg-[#16A34A]"
              )}
              style={{ width: `${Math.min((availableCredits / 500000) * 100, 100)}%` }}
            />
          </div>
          {isOutOfCredits && (
            <p className="text-xs text-[#DC2626] mt-2">
              Sin créditos. Contacta al administrador.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <AppLayout
      currentPath={`/app/cases/${caseId}/chat`}
      creditProps={{
        availableCredits,
        totalCredits: 500000,
        userName: "Carlos Mendoza",
        userRole: "lawyer",
        onLogout: () => {},
      }}
    >
      <div className="flex h-[calc(100vh-56px)] md:h-screen">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="h-14 border-b border-[#E2E8F0] bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-sm font-medium text-[#0F172A] truncate">
                  {mockCase.title}
                </h1>
                <p className="text-xs text-[#64748B] truncate">
                  {mockCase.expedientNumber}
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:flex shrink-0 bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {readyDocuments.length} documentos listos
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile docs button */}
              <Sheet open={mobileDocsOpen} onOpenChange={setMobileDocsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Files className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Documentos del expediente</SheetTitle>
                  </SheetHeader>
                  <DocumentsSidebar />
                </SheetContent>
              </Sheet>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewConversation}
                      className="text-[#64748B] hover:text-[#0F172A]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Nueva conversación</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nueva conversación</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Out of credits banner */}
          {isOutOfCredits && (
            <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[#DC2626] shrink-0" />
              <p className="text-sm text-[#DC2626] flex-1">
                Tu saldo de créditos es 0. No puedes realizar más consultas.
              </p>
              <Button size="sm" variant="outline" className="shrink-0 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white">
                Contactar administrador
              </Button>
            </div>
          )}

          {/* Messages area */}
          <ScrollArea className="flex-1 bg-[#F8FAFC]">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
              {/* Welcome message */}
              {messages.length === 0 && !isStreaming && (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 max-w-lg w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mx-auto mb-4">
                      <Scale className="h-8 w-8 text-[#1E3A5F]" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
                      Consulta tu expediente
                    </h2>
                    <p className="text-sm text-[#64748B] mb-6">
                      Haz preguntas sobre los documentos del caso. Respondo solo con la información que contienen.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {exampleQuestions.map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleClick(question)}
                          className="px-3 py-2 text-sm bg-[#EFF6FF] text-[#2563EB] rounded-full hover:bg-[#DBEAFE] transition-colors text-left"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "user" ? (
                      // User message
                      <div className="flex justify-end gap-3">
                        <div className="max-w-[80%]">
                          <div className="bg-[#1E3A5F] text-white px-4 py-3 rounded-[18px_18px_4px_18px]">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-[#94A3B8] mt-1 text-right">
                            {message.timestamp.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-[#1E3A5F] text-white text-xs">CM</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      // Assistant message
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
                          <Scale className="h-4 w-4 text-[#1E3A5F]" />
                        </div>
                        <div className="flex-1 max-w-[85%]">
                          {/* No match message */}
                          {message.isNoMatch ? (
                            <div className="bg-white border-l-4 border-l-[#D97706] border border-[#E2E8F0] rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <Search className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm text-[#0F172A]">
                                    No se encontró información relevante en los documentos del expediente para esta consulta.
                                  </p>
                                  <p className="text-xs text-[#64748B] mt-2">
                                    Intente reformular la pregunta o verifique que los documentos pertinentes han sido subidos.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white border border-[#E2E8F0] rounded-[4px_18px_18px_18px] p-4 group">
                              {/* Mode badge */}
                              {message.mode && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "mb-2 h-5 text-[10px]",
                                    message.mode === "min" && "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]",
                                    message.mode === "medium" && "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]",
                                    message.mode === "advanced" && "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
                                  )}
                                >
                                  {modeConfig[message.mode].label}
                                </Badge>
                              )}

                              {/* Content */}
                              <div className="text-sm text-[#0F172A] leading-relaxed">
                                {renderContent(message.content)}
                              </div>

                              {/* Inline source citations */}
                              {message.sources && message.sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {message.sources.slice(0, 2).map((source, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleSourceClick(source.documentId)}
                                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-xs text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors"
                                    >
                                      <FileText className="h-3 w-3" />
                                      <span className="truncate max-w-[150px]">{source.documentName}</span>
                                      <span className="text-[#64748B]">Pág. {source.pages}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Sources section */}
                              {message.sources && message.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                                  <p className="text-xs font-medium text-[#64748B] mb-2">Fuentes consultadas</p>
                                  <div className="space-y-2">
                                    {message.sources.map((source, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-[#64748B]" />
                                        <span className="text-xs text-[#0F172A] truncate flex-1">
                                          {source.documentName}
                                        </span>
                                        <span className="text-xs text-[#64748B]">Págs. {source.pages}</span>
                                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-[#16A34A] rounded-full"
                                            style={{ width: `${source.score * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Metrics */}
                              {message.metrics && (
                                <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                                  <p className="text-xs text-[#64748B]">
                                    ↑ {message.metrics.inputTokens.toLocaleString()} tokens input ·{" "}
                                    ↓ {message.metrics.outputTokens.toLocaleString()} tokens output ·{" "}
                                    {message.metrics.creditsConsumed.toLocaleString()} créditos ·{" "}
                                    {message.metrics.latencyMs.toLocaleString()} ms
                                  </p>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-[#64748B] hover:text-[#0F172A]"
                                        onClick={() => handleCopy(message.content)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copiar respuesta</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-[#64748B] hover:text-[#0F172A]"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Exportar a PDF</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-[#94A3B8] cursor-not-allowed"
                                        disabled
                                      >
                                        <ThumbsUp className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Próximamente</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-[#94A3B8] cursor-not-allowed"
                                        disabled
                                      >
                                        <ThumbsDown className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Próximamente</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-[#94A3B8] mt-1">
                            {message.timestamp.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
                      <Scale className="h-4 w-4 text-[#1E3A5F]" />
                    </div>
                    <div className="flex-1 max-w-[85%]">
                      <div className="bg-white border border-[#E2E8F0] rounded-[4px_18px_18px_18px] p-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "mb-2 h-5 text-[10px]",
                            selectedMode === "min" && "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]",
                            selectedMode === "medium" && "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]",
                            selectedMode === "advanced" && "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
                          )}
                        >
                          {modeConfig[selectedMode].label}
                        </Badge>
                        <div className="text-sm text-[#0F172A] leading-relaxed">
                          {renderContent(streamingContent)}
                          <span className="inline-block w-0.5 h-4 bg-[#1E3A5F] ml-0.5 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-[#E2E8F0] bg-white px-4 md:px-6 py-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                {/* Mode selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-2 h-10"
                      disabled={isStreaming || isOutOfCredits}
                    >
                      <div className={cn("w-2 h-2 rounded-full", modeConfig[selectedMode].color)} />
                      <Zap className="h-4 w-4 hidden sm:block" />
                      <span className="hidden sm:inline">{modeConfig[selectedMode].shortLabel}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {(Object.keys(modeConfig) as QueryMode[]).map((mode) => (
                      <DropdownMenuItem
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className="flex items-start gap-3 py-2"
                      >
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", modeConfig[mode].color)} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{modeConfig[mode].label}</p>
                          <p className="text-xs text-[#64748B]">{modeConfig[mode].description}</p>
                          <p className="text-xs text-[#94A3B8] mt-0.5">~{modeConfig[mode].credits.toLocaleString()} créditos</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Textarea */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !hasReadyDocuments
                        ? "No hay documentos listos para consultar..."
                        : isOutOfCredits
                        ? "Sin créditos disponibles..."
                        : "Escribe tu consulta sobre el expediente..."
                    }
                    disabled={isStreaming || isOutOfCredits || !hasReadyDocuments}
                    className="min-h-[40px] max-h-[120px] resize-none pr-12 bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                    rows={1}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-[#94A3B8]">
                    {inputValue.length}/2000
                  </span>
                </div>

                {/* Send/Stop button */}
                {isStreaming ? (
                  <Button
                    onClick={handleCancelStream}
                    className="h-10 w-10 p-0 rounded-full bg-[#DC2626] hover:bg-[#B91C1C]"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isOutOfCredits || !hasReadyDocuments}
                    className="h-10 w-10 p-0 rounded-full bg-[#1E3A5F] hover:bg-[#152d4a] disabled:bg-[#94A3B8]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Credits estimate */}
              <div className="flex items-center justify-between mt-2">
                <p className={cn(
                  "text-xs",
                  insufficientCredits ? "text-[#DC2626]" : "text-[#64748B]"
                )}>
                  ~{estimatedCredits.toLocaleString()} créditos estimados
                  {insufficientCredits && " (créditos insuficientes)"}
                </p>
                <p className="text-xs text-[#94A3B8] text-center hidden sm:block">
                  Itacapp responde solo con la información de los documentos del expediente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Documents (desktop only) */}
        <aside className="hidden md:block w-[280px] shrink-0">
          <DocumentsSidebar />
        </aside>
      </div>
    </AppLayout>
  )
}
