"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, LogOut, Wallet, ChevronDown } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

interface MobileNavProps {
  user: User | null
  profile: {
    full_name?: string
    avatar_url?: string
  } | null
  onClose: () => void
}

export function MobileNav({ user, profile, onClose }: MobileNavProps) {
  const router = useRouter()
  const supabase = createClient()
  const [creditOpen, setCreditOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    router.push("/")
    router.refresh()
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user?.email?.[0].toUpperCase()

  return (
    <div className="absolute top-16 left-0 right-0 border-t border-border bg-background shadow-lg md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-1 px-4 pb-3 pt-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 border-b border-border mb-2">
            <Avatar className="h-10 w-10 border-2 border-accent">
              <AvatarImage
                src={profile?.avatar_url || "/placeholder.svg"}
                alt={profile?.full_name || user.email || ""}
              />
              <AvatarFallback className="bg-accent text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{profile?.full_name || "Usuario"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        <Link
          href="/properties"
          className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
          onClick={onClose}
        >
          Propiedades
        </Link>
        <Link
          href="/benefits"
          className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
          onClick={onClose}
        >
          Tu Beneficio
        </Link>
        <Link
          href="/services"
          className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
          onClick={onClose}
        >
          Servicios
        </Link>

        <div>
          <button
            onClick={() => setCreditOpen(!creditOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
          >
            Simulador de Crédito
            <ChevronDown className={`h-4 w-4 transition-transform ${creditOpen ? "rotate-180" : ""}`} />
          </button>
          {creditOpen && (
            <div className="ml-4 space-y-1">
              <Link
                href="/credit-simulator"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                Simulador
              </Link>
              <Link
                href="/credit-simulator/banks"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                Bancos
              </Link>
            </div>
          )}
        </div>

        {user ? (
          <>
            <div className="border-t border-border my-2" />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
              onClick={onClose}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
              onClick={onClose}
            >
              <Wallet className="h-4 w-4" />
              Billetera
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
            <Button asChild className="w-full mt-2 bg-accent hover:bg-accent/90 text-white" onClick={onClose}>
              <Link href="/dashboard/properties/new">Publicar Propiedad</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2 text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            <Button variant="outline" asChild className="w-full bg-transparent" onClick={onClose}>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white" onClick={onClose}>
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
