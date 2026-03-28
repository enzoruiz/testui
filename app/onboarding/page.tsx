"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Building2, Users, Info, Check, ChevronRight, Loader2 } from "lucide-react"
import { ItacappLogo } from "@/components/itacapp-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type WorkspaceOption = "independent" | "create-org" | "join-org" | null

interface ProfileData {
  fullName: string
  role: string
  usage: string
}

interface OrgData {
  name: string
  ruc: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Step 1 - Profile
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "Juan Pérez", // Pre-filled from registration
    role: "",
    usage: "",
  })
  
  // Step 2 - Workspace
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceOption>(null)
  const [orgData, setOrgData] = useState<OrgData>({
    name: "",
    ruc: "",
  })

  const isStep1Valid = profile.fullName.trim() !== "" && profile.role.trim() !== "" && profile.usage !== ""
  
  const isStep2Valid = () => {
    if (!selectedWorkspace) return false
    if (selectedWorkspace === "create-org" && orgData.name.trim() === "") return false
    return true
  }

  const handleStep1Continue = () => {
    if (isStep1Valid) {
      setCurrentStep(2)
    }
  }

  const handleFinish = async () => {
    if (!isStep2Valid()) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mark onboarding as complete
    localStorage.setItem("itacapp_onboarding_complete", "true")
    
    if (selectedWorkspace === "independent") {
      router.push("/app/dashboard")
    } else if (selectedWorkspace === "create-org") {
      // In real app, create org and get ID
      router.push("/app/organizations/new-org-id")
    } else {
      // Join org - go to dashboard with info banner
      router.push("/app/dashboard?pending_invite=true")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("itacapp_onboarding_complete", "true")
    router.push("/app/dashboard")
  }

  const getButtonText = () => {
    if (isSubmitting) return "Configurando tu espacio..."
    if (selectedWorkspace === "join-org") return "Ir al dashboard"
    return "Empezar con Itacapp"
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 md:py-20 px-4">
      <div className="w-full max-w-[680px]">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <ItacappLogo className="mb-6" />
          
          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between mb-2">
              <span className={cn(
                "text-sm font-medium",
                currentStep >= 1 ? "text-[#1E3A5F]" : "text-[#94A3B8]"
              )}>
                Tu perfil
              </span>
              <span className={cn(
                "text-sm font-medium",
                currentStep >= 2 ? "text-[#1E3A5F]" : "text-[#94A3B8]"
              )}>
                Tu espacio de trabajo
              </span>
            </div>
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1E3A5F] rounded-full transition-all duration-300"
                style={{ width: currentStep === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Step 1 - Profile */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
                Cuéntanos sobre ti
              </h1>
              <p className="text-[#64748B]">
                Esta información nos ayuda a personalizar tu experiencia
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#0F172A]">
                  Nombre completo
                </Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#0F172A]">
                  Cargo / Especialidad
                </Label>
                <Input
                  id="role"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  placeholder="Ej: Abogado tributarista, Contador, Asesor fiscal"
                  className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage" className="text-[#0F172A]">
                  ¿Cómo usarás Itacapp principalmente?
                </Label>
                <Select
                  value={profile.usage}
                  onValueChange={(value) => setProfile({ ...profile, usage: value })}
                >
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own-cases">Análisis de expedientes propios</SelectItem>
                    <SelectItem value="team-collab">Colaboración con un equipo</SelectItem>
                    <SelectItem value="client-cases">Gestión de casos de clientes</SelectItem>
                    <SelectItem value="evaluation">Evaluación de la herramienta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleStep1Continue}
                  disabled={!isStep1Valid}
                  className="bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Workspace */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
                ¿Cómo quieres empezar?
              </h1>
              <p className="text-[#64748B]">
                Puedes cambiar esto en cualquier momento
              </p>
            </div>

            {/* Workspace options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Independent */}
              <button
                onClick={() => setSelectedWorkspace("independent")}
                className={cn(
                  "relative bg-white rounded-lg border-2 p-5 text-left transition-all duration-200",
                  "hover:border-[#2563EB] hover:shadow-md",
                  selectedWorkspace === "independent"
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#E2E8F0]"
                )}
              >
                {selectedWorkspace === "independent" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <User className="w-10 h-10 text-[#1E3A5F] mb-3" />
                <h3 className="font-semibold text-[#0F172A] mb-2">
                  Trabajo independiente
                </h3>
                <p className="text-sm text-[#64748B] mb-3">
                  Analiza tus propios expedientes. Tus casos son privados y solo visibles para ti.
                </p>
                <span className="inline-block text-xs font-medium bg-[#F0FDF4] text-[#16A34A] px-2 py-1 rounded-full">
                  50,000 créditos gratuitos incluidos
                </span>
              </button>

              {/* Create org */}
              <button
                onClick={() => setSelectedWorkspace("create-org")}
                className={cn(
                  "relative bg-white rounded-lg border-2 p-5 text-left transition-all duration-200",
                  "hover:border-[#2563EB] hover:shadow-md",
                  selectedWorkspace === "create-org"
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#E2E8F0]"
                )}
              >
                {selectedWorkspace === "create-org" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Building2 className="w-10 h-10 text-[#1E3A5F] mb-3" />
                <h3 className="font-semibold text-[#0F172A] mb-2">
                  Crear mi organización
                </h3>
                <p className="text-sm text-[#64748B] mb-3">
                  Invita colaboradores, comparte expedientes y gestiona créditos del equipo.
                </p>
                <span className="inline-block text-xs font-medium bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded-full">
                  Recomendado para estudios y empresas
                </span>
              </button>

              {/* Join org */}
              <button
                onClick={() => setSelectedWorkspace("join-org")}
                className={cn(
                  "relative bg-white rounded-lg border-2 p-5 text-left transition-all duration-200",
                  "hover:border-[#2563EB] hover:shadow-md",
                  selectedWorkspace === "join-org"
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#E2E8F0]"
                )}
              >
                {selectedWorkspace === "join-org" && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Users className="w-10 h-10 text-[#1E3A5F] mb-3" />
                <h3 className="font-semibold text-[#0F172A] mb-2">
                  Unirme a una organización
                </h3>
                <p className="text-sm text-[#64748B] mb-3">
                  Si alguien ya creó una organización, el administrador debe invitarte por correo.
                </p>
                <div className="flex items-start gap-2 text-xs text-[#64748B] bg-[#F8FAFC] rounded p-2">
                  <Info className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                  <span>Pide al administrador de tu organización que te invite.</span>
                </div>
              </button>
            </div>

            {/* Create org form - inline */}
            {selectedWorkspace === "create-org" && (
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 mb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-[#0F172A]">
                      Nombre de la organización
                    </Label>
                    <Input
                      id="orgName"
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      placeholder="Ej: Estudio Jurídico ABC"
                      className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ruc" className="text-[#0F172A]">
                      RUC <span className="text-[#94A3B8]">(opcional)</span>
                    </Label>
                    <Input
                      id="ruc"
                      value={orgData.ruc}
                      onChange={(e) => setOrgData({ ...orgData, ruc: e.target.value })}
                      placeholder="20123456789"
                      className="border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Final button */}
            <Button
              onClick={handleFinish}
              disabled={!isStep2Valid() || isSubmitting}
              className="w-full bg-[#1E3A5F] hover:bg-[#152d4a] text-white h-12 text-base"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getButtonText()}
              {!isSubmitting && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>

            {/* Skip link */}
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-[#64748B] hover:text-[#1E3A5F] transition-colors"
              >
                Saltar por ahora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
