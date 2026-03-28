"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  MessageSquare, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react"
import { ItacappLogo } from "@/components/itacapp-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

type ErrorType = "credentials" | "inactive" | null

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorType>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    
    if (!email) {
      errors.email = "El correo electrónico es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Ingresa un correo electrónico válido"
    }
    
    if (!password) {
      errors.password = "La contraseña es requerida"
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulated API call - replace with actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo: simulate different responses based on email
      if (email === "inactive@example.com") {
        setError("inactive")
        return
      }
      
      if (email === "error@example.com") {
        setError("credentials")
        return
      }
      
      // Simulated successful login
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      localStorage.setItem("itacapp_token", mockToken)
      
      // Check if onboarding is needed (demo: check email)
      if (email.includes("new")) {
        router.push("/app/onboarding")
      } else {
        router.push("/app/dashboard")
      }
    } catch {
      setError("credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Open Google OAuth popup
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    window.open(
      "/api/auth/google",
      "google-oauth",
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }

  const features = [
    { icon: FileText, text: "Carga resoluciones, escritos y expedientes" },
    { icon: MessageSquare, text: "Consulta en lenguaje natural" },
    { icon: Shield, text: "Datos aislados por organización" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left column - Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A5F] flex-col justify-between p-12">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <ItacappLogo variant="light" className="mb-6" />
          <p className="text-white/90 text-lg mb-10 max-w-sm">
            Analiza expedientes fiscales con inteligencia artificial
          </p>
          <div className="space-y-4 text-left">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/85">
                <feature.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        <footer className="text-center">
          <p className="text-white/50 text-xs">© 2025 Itacapp</p>
        </footer>
      </div>

      {/* Right column - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-12">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <ItacappLogo variant="dark" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#0F172A]">Bienvenido</h1>
            <p className="text-sm text-[#64748B] mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {/* Google OAuth button */}
          <Button
            variant="outline"
            className="w-full border-[#E2E8F0] hover:bg-[#F8FAFC] h-11"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continuar con Google
          </Button>

          {/* Separator */}
          <div className="relative my-6">
            <Separator className="bg-[#E2E8F0]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-[#64748B]">
              o
            </span>
          </div>

          {/* Error banner */}
          {error && (
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg mb-4 text-sm",
              "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
            )}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {error === "credentials" && "Correo o contraseña incorrectos"}
                {error === "inactive" && "Tu cuenta ha sido desactivada. Contacta al administrador."}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#0F172A]">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: undefined }))
                    }
                  }}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]",
                    fieldErrors.email && "border-[#DC2626] focus-visible:ring-[#DC2626]"
                  )}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-[#DC2626]">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: undefined }))
                    }
                  }}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 pr-10 h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]",
                    fieldErrors.password && "border-[#DC2626] focus-visible:ring-[#DC2626]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-[#DC2626]">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#2563EB] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-sm text-center text-[#64748B] mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-[#2563EB] hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
