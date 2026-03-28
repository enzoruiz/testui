"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Gift, 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle
} from "lucide-react"
import { ItacappLogo } from "@/components/itacapp-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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

type PasswordStrength = "weak" | "fair" | "good" | "strong"

function getPasswordStrength(password: string): { strength: PasswordStrength; score: number } {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  const strengthMap: Record<number, PasswordStrength> = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong"
  }
  
  return { strength: strengthMap[score], score }
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { strength, score } = getPasswordStrength(password)
  
  const colorMap: Record<PasswordStrength, string> = {
    weak: "bg-[#DC2626]",
    fair: "bg-[#F97316]",
    good: "bg-[#EAB308]",
    strong: "bg-[#16A34A]"
  }
  
  const labelMap: Record<PasswordStrength, string> = {
    weak: "Débil",
    fair: "Regular",
    good: "Buena",
    strong: "Fuerte"
  }
  
  const textColorMap: Record<PasswordStrength, string> = {
    weak: "text-[#DC2626]",
    fair: "text-[#F97316]",
    good: "text-[#EAB308]",
    strong: "text-[#16A34A]"
  }
  
  if (!password) return null
  
  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              segment <= score ? colorMap[strength] : "bg-[#E2E8F0]"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs", textColorMap[strength])}>
        {labelMap[strength]}
      </p>
    </div>
  )
}

type ErrorType = "email_exists" | "server" | null

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorType>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors }
    
    switch (field) {
      case "fullName":
        if (!value.trim()) {
          errors.fullName = "El nombre es requerido"
        } else if (value.trim().length < 2) {
          errors.fullName = "El nombre debe tener al menos 2 caracteres"
        } else {
          delete errors.fullName
        }
        break
      case "email":
        if (!value) {
          errors.email = "El correo electrónico es requerido"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Ingresa un correo electrónico válido"
        } else {
          delete errors.email
        }
        break
      case "password":
        if (!value) {
          errors.password = "La contraseña es requerida"
        } else if (value.length < 8) {
          errors.password = "La contraseña debe tener al menos 8 caracteres"
        } else if (!/[A-Z]/.test(value)) {
          errors.password = "La contraseña debe tener al menos una mayúscula"
        } else if (!/[0-9]/.test(value)) {
          errors.password = "La contraseña debe tener al menos un número"
        } else {
          delete errors.password
        }
        // Also validate confirm password if it exists
        if (confirmPassword && value !== confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden"
        } else if (confirmPassword) {
          delete errors.confirmPassword
        }
        break
      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Confirma tu contraseña"
        } else if (value !== password) {
          errors.confirmPassword = "Las contraseñas no coinciden"
        } else {
          delete errors.confirmPassword
        }
        break
    }
    
    setFieldErrors(errors)
  }

  const isFormValid = () => {
    const { strength } = getPasswordStrength(password)
    return (
      fullName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      password === confirmPassword &&
      acceptTerms &&
      (strength === "good" || strength === "strong" || strength === "fair")
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!isFormValid()) return
    
    setIsLoading(true)
    
    try {
      // Simulated API call - replace with actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo: simulate email already exists
      if (email === "existe@example.com") {
        setError("email_exists")
        return
      }
      
      // Demo: simulate server error
      if (email === "error@example.com") {
        setError("server")
        return
      }
      
      // Simulated successful registration
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      localStorage.setItem("itacapp_token", mockToken)
      
      // Show success toast
      setShowSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/app/onboarding")
      }, 3000)
    } catch {
      setError("server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
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

  // Auto-hide success toast after showing
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const features = [
    { icon: Gift, text: "50,000 créditos gratuitos al registrarte" },
    { icon: Building2, text: "Crea o únete a una organización" },
    { icon: Lock, text: "Tus documentos, solo tuyos" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-4 py-3 rounded-lg shadow-lg">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              ¡Cuenta creada! Recibiste 50,000 créditos gratuitos.
            </span>
          </div>
        </div>
      )}

      {/* Left column - Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A5F] flex-col justify-between p-12">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <ItacappLogo variant="light" className="mb-6" />
          <p className="text-white/90 text-lg mb-10 max-w-sm">
            Comienza a analizar tus expedientes hoy
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
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-12 py-8">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <ItacappLogo variant="dark" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">Crear cuenta</h1>
            <p className="text-sm text-[#64748B] mt-1">Empieza gratis, sin tarjeta de crédito</p>
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
              "flex items-start gap-2 p-3 rounded-lg mb-4 text-sm",
              "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
            )}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {error === "email_exists" && (
                  <>
                    Este correo ya está en uso.{" "}
                    <Link href="/auth/login" className="underline hover:no-underline">
                      ¿Quieres iniciar sesión?
                    </Link>
                  </>
                )}
                {error === "server" && "Ocurrió un error. Por favor, inténtalo de nuevo."}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#0F172A]">
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => validateField("fullName", fullName)}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]",
                    fieldErrors.fullName && "border-[#DC2626] focus-visible:ring-[#DC2626]"
                  )}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs text-[#DC2626]">{fieldErrors.fullName}</p>
              )}
            </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateField("email", email)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validateField("password", password)}
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
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Confirm password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#0F172A]">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => validateField("confirmPassword", confirmPassword)}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 pr-10 h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]",
                    fieldErrors.confirmPassword && "border-[#DC2626] focus-visible:ring-[#DC2626]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-[#DC2626]">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isLoading}
                className="mt-0.5 border-[#E2E8F0] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
              />
              <Label htmlFor="terms" className="text-sm text-[#64748B] leading-tight cursor-pointer">
                Acepto los{" "}
                <Link href="/terms" className="text-[#2563EB] hover:underline">
                  términos y condiciones
                </Link>
              </Label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#1E3A5F] hover:bg-[#152d4a] text-white"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-sm text-center text-[#64748B] mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-[#2563EB] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
