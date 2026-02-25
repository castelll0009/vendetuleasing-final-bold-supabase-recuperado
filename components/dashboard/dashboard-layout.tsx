"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Building2, Wallet, Bell, Settings, LogOut, Menu, X, PlusCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/database"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  profile: Profile | null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Mis Propiedades", href: "/dashboard/properties", icon: Building2 },
  // { name: "Billetera", href: "/dashboard/wallet", icon: Wallet },
  // { name: "Alertas de Precios", href: "/dashboard/alerts", icon: Bell },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
]

export function DashboardLayout({ children, user, profile }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Vende Tu Leasing"
                  width={160}
                  height={48}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild className="hidden md:flex bg-accent hover:bg-accent/90 text-white">
                <Link href="/dashboard/properties/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Propiedad
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              <div className="hidden md:flex items-center gap-3">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.full_name || "Usuario"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{profile?.full_name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-accent/10 hover:text-accent",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Button variant="ghost" className="w-full justify-start text-base font-medium" onClick={handleSignOut}>
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background">
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-accent/10 hover:text-accent",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
