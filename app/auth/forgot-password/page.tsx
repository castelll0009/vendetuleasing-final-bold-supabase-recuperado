"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al enviar el correo de recuperación")
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
                <CardTitle className="text-2xl font-sans text-center">Correo Enviado</CardTitle>
                <CardDescription className="font-sans text-center">
                  Revisa tu correo electrónico para restablecer tu contraseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-sans text-center">
                    Te hemos enviado un correo a <strong>{email}</strong> con instrucciones para restablecer tu
                    contraseña.
                  </p>
                  <p className="text-sm text-muted-foreground font-sans text-center">
                    Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                  </p>
                  <Button asChild className="w-full bg-[#ff8414] hover:bg-[#e67a0d] text-white font-sans">
                    <Link href="/auth/login">Volver al inicio de sesión</Link>
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
              <CardTitle className="text-2xl font-sans">Recuperar Contraseña</CardTitle>
              <CardDescription className="font-sans">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-6">
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
                  {error && <p className="text-sm text-destructive font-sans">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#ff8414] hover:bg-[#e67a0d] text-white font-sans"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm font-sans">
                  <Link href="/auth/login" className="underline underline-offset-4 text-[#ff8414] hover:text-[#e67a0d]">
                    Volver al inicio de sesión
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
