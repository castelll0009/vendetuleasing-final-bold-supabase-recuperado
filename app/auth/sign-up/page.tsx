"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("Este correo electrónico ya está registrado")
        }
        throw error
      }

      console.log("[v0] User signed up successfully:", data)

      // Just redirect to success page
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.error("[v0] Sign up error:", error)
      setError(error instanceof Error ? error.message : "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Vende Tu Leasing" width={200} height={60} className="h-12 w-auto" />
          </div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-sans">Crear Cuenta</CardTitle>
              <CardDescription className="font-sans">Regístrate para comenzar a publicar propiedades</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="font-sans">
                      Nombre Completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Pérez"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-sans">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-sans">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-sans">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive font-sans">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#ff8414] hover:bg-[#e67a0d] text-white font-sans"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando cuenta..." : "Registrarse"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm font-sans">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-[#ff8414] hover:text-[#e67a0d]">
                    Inicia sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
