"use client"

import {
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  FolderOpen,
  Plus,
  Download,
  Scale,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge, type BadgeType } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { ItacappLogo } from "@/components/itacapp-logo"
import { Button } from "@/components/ui/button"

const colorTokens = [
  { name: "primary", value: "#1E3A5F", label: "Primary (Dark Navy)" },
  { name: "primary-hover", value: "#152d4a", label: "Primary Hover" },
  { name: "primary-light", value: "#EFF6FF", label: "Primary Light" },
  { name: "accent", value: "#2563EB", label: "Accent (Action Blue)" },
  { name: "accent-hover", value: "#1D4ED8", label: "Accent Hover" },
  { name: "background", value: "#F8FAFC", label: "Background" },
  { name: "surface", value: "#FFFFFF", label: "Surface" },
  { name: "border", value: "#E2E8F0", label: "Border" },
  { name: "text-primary", value: "#0F172A", label: "Text Primary" },
  { name: "text-secondary", value: "#64748B", label: "Text Secondary" },
  { name: "text-muted", value: "#94A3B8", label: "Text Muted" },
  { name: "success", value: "#16A34A", label: "Success" },
  { name: "success-light", value: "#F0FDF4", label: "Success Light" },
  { name: "warning", value: "#D97706", label: "Warning" },
  { name: "warning-light", value: "#FFFBEB", label: "Warning Light" },
  { name: "danger", value: "#DC2626", label: "Danger" },
  { name: "danger-light", value: "#FEF2F2", label: "Danger Light" },
]

const allBadgeTypes: BadgeType[] = [
  "active",
  "archived",
  "pending",
  "processing",
  "ready",
  "error",
  "personal",
  "sunat",
  "tribunal",
  "poder-judicial",
  "owner",
  "admin",
  "lawyer",
  "min",
  "medium",
  "advanced",
]

export default function DesignSystemPage() {
  const creditProps = {
    availableCredits: 32450,
    totalCredits: 50000,
    userName: "María García López",
    userRole: "admin" as const,
    onLogout: () => alert("Cerrar sesión"),
  }

  return (
    <AppLayout
      currentPath="/design-system"
      creditProps={creditProps}
      processingCount={3}
    >
      <PageHeader
        title="Sistema de Diseño"
        subtitle="Documentación de componentes y tokens de diseño de Itacapp"
        breadcrumb={[
          { label: "Inicio", href: "/app/dashboard" },
          { label: "Sistema de Diseño" },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo componente
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-12">
        {/* Color Swatches */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            Paleta de Colores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colorTokens.map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className="h-16 rounded-lg border border-[#E2E8F0] shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-xs font-medium text-[#0F172A]">
                  {color.label}
                </p>
                <p className="text-xs text-[#64748B] font-mono">{color.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logo Variants */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            Logo Itacapp
          </h2>
          <div className="flex flex-wrap gap-8">
            <div className="p-6 bg-white border border-[#E2E8F0] rounded-lg">
              <p className="text-xs text-[#64748B] mb-3">Variante Dark</p>
              <ItacappLogo variant="dark" />
            </div>
            <div className="p-6 bg-[#1E3A5F] rounded-lg">
              <p className="text-xs text-white/60 mb-3">Variante Light</p>
              <ItacappLogo variant="light" />
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            StatCard - Tarjetas de Estadísticas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Casos activos"
              value={156}
              subtitle="en los últimos 30 días"
              icon={FileText}
              trend={{ value: 12, label: "vs mes anterior" }}
            />
            <StatCard
              title="Usuarios"
              value={24}
              subtitle="en la organización"
              icon={Users}
              trend={{ value: -5, label: "vs mes anterior" }}
            />
            <StatCard
              title="Créditos bajos"
              value="15,000"
              subtitle="Considera recargar pronto"
              icon={TrendingUp}
              variant="warning"
            />
            <StatCard
              title="Errores de procesamiento"
              value={3}
              subtitle="Requieren atención inmediata"
              icon={AlertCircle}
              variant="danger"
              action={{
                label: "Ver errores",
                onClick: () => alert("Ver errores"),
              }}
            />
          </div>
        </section>

        {/* Status Badges */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            StatusBadge - Etiquetas de Estado
          </h2>
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
            <div className="flex flex-wrap gap-3">
              {allBadgeTypes.map((type) => (
                <StatusBadge key={type} type={type} />
              ))}
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            EmptyState - Estado Vacío
          </h2>
          <div className="bg-white border border-[#E2E8F0] rounded-lg">
            <EmptyState
              icon={FolderOpen}
              title="No hay casos"
              description="Aún no tienes casos creados. Crea tu primer caso para comenzar a analizar expedientes tributarios."
              action={{
                label: "Crear primer caso",
                onClick: () => alert("Crear caso"),
              }}
            />
          </div>
        </section>

        {/* Page Header Demo */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            PageHeader - Cabecera de Página
          </h2>
          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <PageHeader
              title="Caso #12345"
              subtitle="Expediente de impugnación SUNAT"
              breadcrumb={[
                { label: "Casos", href: "/app/cases" },
                { label: "SUNAT", href: "/app/cases?filter=sunat" },
                { label: "Caso #12345" },
              ]}
              actions={
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                  <Scale className="h-4 w-4 mr-2" />
                  Analizar
                </Button>
              }
              className="relative"
            />
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
            Tipografía (Inter)
          </h2>
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">text-2xl font-bold</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                Análisis Tributario con IA
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">text-xl font-semibold</p>
              <p className="text-xl font-semibold text-[#0F172A]">
                Expedientes Judiciales
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">text-base</p>
              <p className="text-base text-[#0F172A]">
                Texto de párrafo regular para contenido principal de la aplicación.
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">text-sm text-secondary</p>
              <p className="text-sm text-[#64748B]">
                Texto secundario para subtítulos y descripciones.
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">text-xs text-muted</p>
              <p className="text-xs text-[#94A3B8]">
                Texto de ayuda o metadatos.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Botones</h2>
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white">
                Primary
              </Button>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                Accent
              </Button>
              <Button
                variant="outline"
                className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
              >
                Outline
              </Button>
              <Button
                variant="ghost"
                className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                Ghost
              </Button>
              <Button
                variant="destructive"
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              >
                Destructive
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
