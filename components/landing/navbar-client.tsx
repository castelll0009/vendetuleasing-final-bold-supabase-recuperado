"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { MobileNav } from "./mobile-nav"

interface NavbarClientProps {
  user: User | null
  profile: {
    full_name?: string
    avatar_url?: string
  } | null
  isTransparent?: boolean
}

export function NavbarClient({ user, profile, isTransparent = false }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="flex md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={isTransparent ? "text-white hover:bg-white/10" : ""}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <MobileNav user={user} profile={profile} onClose={() => setIsMenuOpen(false)} />}
    </>
  )
}
