import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, Key } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Encuentra Excelentes Ofertas",
    description: "Explora miles de propiedades con nuestro sistema de búsqueda avanzado y filtros personalizados",
  },
  {
    icon: FileText,
    title: "Publica Tu Propiedad",
    description:
      "Registra tu cuenta y publica tus propiedades de forma rápida y sencilla con nuestro sistema intuitivo",
  },
  {
    icon: Key,
    title: "Soporte Rápido y Amigable",
    description: "Nuestro equipo está disponible para ayudarte en cada paso del proceso de compra o venta",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Encuentra la Opción de Venta Perfecta</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A medida que aumenta la complejidad de los edificios, el campo de la arquitectura evoluciona
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="border-border transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <step.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
