// components/landing/contact-section.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="w-full border-t bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-2 items-start ">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Contacto
            </h2>
            <p className="text-muted-foreground mb-4">
              Cuéntanos en qué etapa estás y te ayudamos a tomar la mejor decisión con tu leasing habitacional.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Teléfono:</span> +(57) 920 851 9087</p>
              <p><span className="font-medium text-foreground">Correo:</span> hola@vendeTuLeasing.com</p>
              <p><span className="font-medium text-foreground">Horario:</span> Lunes a viernes, 8:00 a.m. – 6:00 p.m.</p>
            </div>
          </div>

          {/* <div className="rounded-xl border bg-muted/40 p-6 shadow-sm">
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Nombre completo
                </label>
                <Input id="name" placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Correo electrónico
                </label>
                <Input id="email" type="email" placeholder="tucorreo@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  placeholder="Cuéntanos brevemente qué necesitas o en qué etapa estás con tu leasing."
                  className="min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar mensaje
              </Button>
            </form>
          </div> */}
        </div>
      </div>
    </section>
  )
}
