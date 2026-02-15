import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="Vende Tu Leasing"
              width={160}
              height={48}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm text-primary-foreground/80">Atención al Cliente Totalmente Gratuita</p>
            <p className="text-lg font-semibold">+(57) 920 851 9087</p>
            <p className="text-sm text-primary-foreground/80">hola@vendeTuLeasing.com</p>
            <div className="flex gap-3 pt-2">
              <Button size="icon" variant="ghost" className="hover:bg-primary-foreground/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-primary-foreground/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-primary-foreground/10">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-primary-foreground/10">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Búsquedas Populares */}
          <div>
            <h3 className="font-semibold mb-4">Búsquedas Populares</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/properties?city=Bogotá" className="hover:text-accent transition-colors">
                  Bogotá
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Medellín" className="hover:text-accent transition-colors">
                  Medellín
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Cali" className="hover:text-accent transition-colors">
                  Cali
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Cartagena" className="hover:text-accent transition-colors">
                  Cartagena
                </Link>
              </li>
              <li>
                <Link href="/properties?type=apartment" className="hover:text-accent transition-colors">
                  Apartamentos en Renta
                </Link>
              </li>
              <li>
                <Link href="/properties?type=house&status=for_sale" className="hover:text-accent transition-colors">
                  Casas en Venta
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces Rápidos */}
        {/* Enlaces Rápidos */}
<div>
  <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
  <ul className="space-y-2 text-sm text-primary-foreground/80">
    <li>
      <Link href="/about" className="hover:text-accent transition-colors">
        ¿Quiénes somos?
      </Link>
    </li>
    <li>
      <Link href="/terms" className="hover:text-accent transition-colors">
        Términos de Uso
      </Link>
    </li>
    <li>
      <Link href="/privacy" className="hover:text-accent transition-colors">
        Política de Privacidad
      </Link>
    </li>
    <li>
      <Link href="/pricing" className="hover:text-accent transition-colors">
        Planes y Precios
      </Link>
    </li>
    <li>
      <Link href="/contact" className="hover:text-accent transition-colors">
        Contacto
      </Link>
    </li>
    <li>
      <Link href="/careers" className="hover:text-accent transition-colors">
        Carreras
      </Link>
    </li>
  </ul>
</div>


          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Mantente Actualizado</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">Suscríbete para recibir alertas de las nuevas publicaciones.</p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="w-full bg-accent hover:bg-accent/90 text-white">Suscribirse</Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© Vende Tu Leasing 2024 - Todos los derechos reservados</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-accent transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-accent transition-colors">
                Términos
              </Link>
              <Link href="/sitemap" className="hover:text-accent transition-colors">
                Mapa del Sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
