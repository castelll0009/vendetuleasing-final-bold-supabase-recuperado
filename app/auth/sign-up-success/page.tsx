import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Vende Tu Leasing"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-sans">¡Gracias por registrarte!</CardTitle>
              <CardDescription className="font-sans">Verifica tu correo electrónico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground font-sans">
                Te hemos enviado un correo de confirmación. Por favor, verifica tu cuenta antes de iniciar sesión.
              </p>
              <Button asChild className="w-full bg-[#FF7A59] hover:bg-[#FF6A49] text-white font-sans">
                <Link href="/auth/login">Ir a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
