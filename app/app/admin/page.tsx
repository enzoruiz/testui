"use client"

import { useState } from "react"
import {
  MessageSquare,
  Zap,
  Hash,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RelativeTime } from "@/components/relative-time"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"

// Types
type UserRole = "owner" | "admin" | "lawyer"
type QueryMode = "min" | "medium" | "advanced"

interface UserStats {
  id: string
  name: string
  email: string
  role: UserRole
  queriesCount: number
  creditsConsumed: number
  creditsAvailable: number
  lastActivity: Date
}

interface ModeStats {
  mode: QueryMode
  llm: string
  queriesCount: number
  avgInputTokens: number
  avgOutputTokens: number
  avgCredits: number
  avgLatency: number
}

interface CaseStats {
  id: string
  name: string
  expedient: string
  queriesCount: number
  creditsConsumed: number
}

// Mock data
const dailyUsageData = [
  { day: "Lun", consultas: 4500, ingesta: 2200 },
  { day: "Mar", consultas: 5200, ingesta: 1800 },
  { day: "Mié", consultas: 6100, ingesta: 2500 },
  { day: "Jue", consultas: 4800, ingesta: 1600 },
  { day: "Vie", consultas: 7200, ingesta: 3100 },
  { day: "Sáb", consultas: 2100, ingesta: 800 },
  { day: "Dom", consultas: 1500, ingesta: 400 },
]

const modeDistributionData = [
  { name: "Min", value: 143, credits: 98234, color: "#22C55E" },
  { name: "Medium", value: 89, credits: 65312, color: "#F59E0B" },
  { name: "Advanced", value: 34, credits: 27890, color: "#EF4444" },
]

const sparklineData = [
  { value: 45 },
  { value: 52 },
  { value: 48 },
  { value: 61 },
  { value: 55 },
  { value: 67 },
  { value: 72 },
]

const mockUserStats: UserStats[] = [
  {
    id: "user-1",
    name: "Carlos Mendoza",
    email: "carlos@perezasociados.pe",
    role: "owner",
    queriesCount: 89,
    creditsConsumed: 65420,
    creditsAvailable: 45000,
    lastActivity: new Date(2026, 2, 28, 14, 30),
  },
  {
    id: "user-2",
    name: "María García",
    email: "maria@perezasociados.pe",
    role: "admin",
    queriesCount: 124,
    creditsConsumed: 92340,
    creditsAvailable: 32000,
    lastActivity: new Date(2026, 2, 28, 10, 15),
  },
  {
    id: "user-3",
    name: "José Rodríguez",
    email: "jose@perezasociados.pe",
    role: "lawyer",
    queriesCount: 45,
    creditsConsumed: 31200,
    creditsAvailable: 8500,
    lastActivity: new Date(2026, 2, 27, 16, 45),
  },
  {
    id: "user-4",
    name: "Ana Sánchez",
    email: "ana@perezasociados.pe",
    role: "lawyer",
    queriesCount: 28,
    creditsConsumed: 20000,
    creditsAvailable: 0,
    lastActivity: new Date(2026, 2, 26, 9, 0),
  },
]

const mockModeStats: ModeStats[] = [
  {
    mode: "min",
    llm: "GPT-4o mini",
    queriesCount: 143,
    avgInputTokens: 5892,
    avgOutputTokens: 387,
    avgCredits: 7054,
    avgLatency: 1240,
  },
  {
    mode: "medium",
    llm: "GPT-4o",
    queriesCount: 89,
    avgInputTokens: 6102,
    avgOutputTokens: 412,
    avgCredits: 7338,
    avgLatency: 1890,
  },
  {
    mode: "advanced",
    llm: "Claude Sonnet",
    queriesCount: 34,
    avgInputTokens: 6340,
    avgOutputTokens: 521,
    avgCredits: 7903,
    avgLatency: 2100,
  },
]

const mockTopCases: CaseStats[] = [
  {
    id: "case-1",
    name: "Caso García vs. Municipalidad",
    expedient: "00234-2024-0-1801-JR-CI-01",
    queriesCount: 45,
    creditsConsumed: 32450,
  },
  {
    id: "case-2",
    name: "Demanda Laboral Torres",
    expedient: "01567-2024-0-1801-JR-LA-02",
    queriesCount: 38,
    creditsConsumed: 28120,
  },
  {
    id: "case-3",
    name: "Proceso Constitucional López",
    expedient: "00089-2024-0-1801-JR-CO-03",
    queriesCount: 31,
    creditsConsumed: 24890,
  },
  {
    id: "case-4",
    name: "Caso Comercial Inversiones SAC",
    expedient: "02341-2024-0-1801-JR-CO-04",
    queriesCount: 28,
    creditsConsumed: 21340,
  },
  {
    id: "case-5",
    name: "Divorcio Mendoza-Paredes",
    expedient: "00456-2024-0-1801-JR-FC-05",
    queriesCount: 24,
    creditsConsumed: 18760,
  },
]

const mockTopUsers = [
  { id: "user-2", name: "María García", queriesCount: 124, creditsConsumed: 92340 },
  { id: "user-1", name: "Carlos Mendoza", queriesCount: 89, creditsConsumed: 65420 },
  { id: "user-3", name: "José Rodríguez", queriesCount: 45, creditsConsumed: 31200 },
  { id: "user-4", name: "Ana Sánchez", queriesCount: 28, creditsConsumed: 20000 },
  { id: "user-5", name: "Luis Herrera", queriesCount: 22, creditsConsumed: 16540 },
]

const organizations = [
  { id: "org-1", name: "Estudio Jurídico Pérez & Asociados" },
  { id: "org-2", name: "Bufete Legal Torres" },
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

function getModeBadgeVariant(mode: QueryMode) {
  switch (mode) {
    case "min":
      return "bg-[#DCFCE7] text-[#16A34A]"
    case "medium":
      return "bg-[#FEF3C7] text-[#D97706]"
    case "advanced":
      return "bg-[#FEE2E2] text-[#DC2626]"
  }
}

function getModeLabel(mode: QueryMode) {
  switch (mode) {
    case "min":
      return "Min"
    case "medium":
      return "Medium"
    case "advanced":
      return "Advanced"
  }
}



// Sparkline component
function Sparkline({ data }: { data: { value: number }[] }) {
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563EB"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Stat card component
function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  sparkline,
}: {
  title: string
  value: string
  subtitle?: string
  trend?: { value: number; isPositive: boolean }
  icon: React.ComponentType<{ className?: string }>
  sparkline?: boolean
}) {
  return (
    <Card className="border-[#E2E8F0]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-[#64748B]">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              {trend && (
                <span
                  className={`flex items-center text-xs font-medium ${
                    trend.isPositive ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>
            )}
            {sparkline && (
              <div className="mt-3">
                <Sparkline data={sparklineData} />
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#2563EB]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Summary tab
function SummaryTab() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consultas totales"
          value="266"
          trend={{ value: 12, isPositive: true }}
          icon={MessageSquare}
          sparkline
        />
        <StatCard
          title="Créditos consumidos"
          value="191,436"
          subtitle="208 consultas · 58 ingesta"
          icon={Zap}
        />
        <StatCard
          title="Tokens usados"
          value="1.8M"
          subtitle="↑ 1.2M input · ↓ 89K output"
          icon={Hash}
        />
        <StatCard
          title="Costo estimado"
          value="$47.86"
          subtitle="Estimación referencial"
          icon={DollarSign}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily usage chart */}
        <Card className="border-[#E2E8F0] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Uso diario de créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${value / 1000}k` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      value.toLocaleString("es-PE"),
                      "",
                    ]}
                  />
                  <Bar
                    dataKey="consultas"
                    name="Consultas"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                  />
                  <Bar
                    dataKey="ingesta"
                    name="Ingesta"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mode distribution chart */}
        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Distribución por modo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {modeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string, props) => [
                      `${value} consultas (${props.payload.credits.toLocaleString("es-PE")} créditos)`,
                      props.payload.name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-[#64748B]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Users tab
function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = mockUserStats.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-10 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] border-[#E2E8F0]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="lawyer">Lawyer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users table */}
      <Card className="border-[#E2E8F0]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="text-[#64748B]">Usuario</TableHead>
              <TableHead className="text-[#64748B]">Email</TableHead>
              <TableHead className="text-[#64748B]">Rol</TableHead>
              <TableHead className="text-[#64748B] text-center">
                Consultas
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Créditos consumidos
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Créditos disponibles
              </TableHead>
              <TableHead className="text-[#64748B]">Última actividad</TableHead>
              <TableHead className="text-[#64748B] w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-[#E2E8F0]">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-xs">
                      {getInitials(user.name)}
                    </div>
                    <span className="font-medium text-[#0F172A]">
                      {user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[#64748B]">{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-[#0F172A]">
                  {user.queriesCount}
                </TableCell>
                <TableCell className="text-right text-[#DC2626]">
                  {user.creditsConsumed.toLocaleString("es-PE")}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      user.creditsAvailable === 0
                        ? "text-[#DC2626]"
                        : "text-[#16A34A]"
                    }
                  >
                    {user.creditsAvailable.toLocaleString("es-PE")}
                  </span>
                </TableCell>
                <TableCell className="text-[#64748B]">
                  <RelativeTime date={user.lastActivity} />
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
                      <DropdownMenuItem>Asignar créditos</DropdownMenuItem>
                      <DropdownMenuItem>Ver historial</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// Metrics tab
function MetricsTab() {
  return (
    <div className="space-y-6">
      {/* Mode stats table */}
      <Card className="border-[#E2E8F0]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0F172A]">
            Métricas por modo de consulta
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="text-[#64748B]">Modo</TableHead>
              <TableHead className="text-[#64748B]">LLM</TableHead>
              <TableHead className="text-[#64748B] text-center">
                Consultas
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Avg input tokens
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Avg output tokens
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Avg créditos
              </TableHead>
              <TableHead className="text-[#64748B] text-right">
                Avg latencia
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockModeStats.map((stat) => (
              <TableRow key={stat.mode} className="border-[#E2E8F0]">
                <TableCell>
                  <Badge className={getModeBadgeVariant(stat.mode)}>
                    {getModeLabel(stat.mode)}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#0F172A] font-medium">
                  {stat.llm}
                </TableCell>
                <TableCell className="text-center text-[#0F172A]">
                  {stat.queriesCount}
                </TableCell>
                <TableCell className="text-right text-[#64748B]">
                  {stat.avgInputTokens.toLocaleString("es-PE")}
                </TableCell>
                <TableCell className="text-right text-[#64748B]">
                  {stat.avgOutputTokens.toLocaleString("es-PE")}
                </TableCell>
                <TableCell className="text-right text-[#0F172A]">
                  {stat.avgCredits.toLocaleString("es-PE")}
                </TableCell>
                <TableCell className="text-right text-[#64748B]">
                  {stat.avgLatency.toLocaleString("es-PE")}ms
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Top cases and users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top cases */}
        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Top 5 casos más costosos
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                <TableHead className="text-[#64748B]">Caso</TableHead>
                <TableHead className="text-[#64748B] text-center">
                  Consultas
                </TableHead>
                <TableHead className="text-[#64748B] text-right">
                  Créditos
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTopCases.map((caseItem, index) => (
                <TableRow key={caseItem.id} className="border-[#E2E8F0]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#0F172A]">
                        {index + 1}. {caseItem.name}
                      </p>
                      <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                        {caseItem.expedient}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-[#0F172A]">
                    {caseItem.queriesCount}
                  </TableCell>
                  <TableCell className="text-right font-medium text-[#0F172A]">
                    {caseItem.creditsConsumed.toLocaleString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Top users */}
        <Card className="border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F172A]">
              Top 5 usuarios más activos
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                <TableHead className="text-[#64748B]">Usuario</TableHead>
                <TableHead className="text-[#64748B] text-center">
                  Consultas
                </TableHead>
                <TableHead className="text-[#64748B] text-right">
                  Créditos
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTopUsers.map((user, index) => (
                <TableRow key={user.id} className="border-[#E2E8F0]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-[#64748B] font-medium w-4">
                        {index + 1}.
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-medium text-xs">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-[#0F172A]">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-[#0F172A]">
                    {user.queriesCount}
                  </TableCell>
                  <TableCell className="text-right font-medium text-[#0F172A]">
                    {user.creditsConsumed.toLocaleString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [selectedOrg, setSelectedOrg] = useState(organizations[0].id)
  const [dateRange, setDateRange] = useState("7d")

  return (
    <AppLayout
      currentPath="/app/admin"
      creditProps={{
        availableCredits: 42500,
        totalCredits: 100000,
        userName: "Carlos Mendoza",
        userRole: "owner",
        onLogout: () => {},
      }}
    >
      <PageHeader
        title="Panel de administración"
        breadcrumb={[{ label: "Administración" }]}
        actions={
          <div className="flex items-center gap-3">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[280px] border-[#E2E8F0] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px] border-[#E2E8F0] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Último mes</SelectItem>
                <SelectItem value="custom">Rango personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="bg-[#F1F5F9] p-1">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
            >
              Usuarios
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A]"
            >
              Métricas de tokens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
