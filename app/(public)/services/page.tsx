import { ServicesSection } from "@/components/landing/services-section"

export default function ServicesPage() {
  return (
    <main className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Servicios reales del portal, enfocados en leasing habitacional y toma de decisiones informadas.
          </p>
        </div>

        <ServicesSection />
      </div>
    </main>
  )
}
