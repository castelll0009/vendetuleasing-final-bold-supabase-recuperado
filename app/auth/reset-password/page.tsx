"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verify that we have a valid session from the reset link
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login")
      }
    })
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error
      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al restablecer la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/design-mode/2.logo.png"
                alt="Vende Tu Leasing"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <Card className="border-border">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-[#ff8414]" />
                </div>
                <CardTitle className="text-2xl font-sans text-center">Contraseña Actualizada</CardTitle>
                <CardDescription className="font-sans text-center">
                  Tu contraseña ha sido restablecida exitosamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-sans text-center">
                    Serás redirigido al inicio de sesión en unos segundos...
                  </p>
                  <Button asChild className="w-full bg-[#ff8414] hover:bg-[#e67a0d] text-white font-sans">
                    <Link href="/auth/login">Ir al inicio de sesión</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/design-mode/2.logo.png"
              alt="Vende Tu Leasing"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-sans">Nueva Contraseña</CardTitle>
              <CardDescription className="font-sans">Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-sans">
                      Nueva Contraseña
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
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="font-sans">
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive font-sans">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#ff8414] hover:bg-[#e67a0d] text-white font-sans"
                    disabled={isLoading}
                  >
                    {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
