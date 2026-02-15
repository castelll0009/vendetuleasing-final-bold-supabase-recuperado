import Link from "next/link"
import { Home, BarChart3, Calculator } from "lucide-react"

type Service = {
  icon: React.ElementType
  title: string
  subtitle: string
  impact: string
  description: string
  features: string[]
  href?: string
  cta?: string
}

export function ServicesSection() {
  const services: Service[] = [
    {
      icon: Home,
      title: "Compra y Venta",
      subtitle: "con Leasing Habitacional",
      impact: "Ahorro y proceso ágil",
      description:
        "Facilitamos la venta y compra de inmuebles con crédito leasing habitacional de forma ágil, segura y con un ahorro significativo para ambas partes.",
      features: [
        "💰 Ahorro inmediato para comprador y vendedor: sin gastos de escrituración, notaría, estudio de títulos, registro, boleta fiscal ni retención en la fuente. Solo se hace una cesión del leasing.",
        "⚡ Proceso más rápido y sin trámites complejos: la transferencia se realiza directamente con el banco, evitando procesos largos y costosos.",
        "🧑‍💼 Asesoría personalizada en todo el proceso: acompañamiento desde la publicación hasta la aprobación de la cesión del leasing.",
        "🏠 Publica tu propiedad y recibe compradores reales: interesados en inmuebles con leasing en el mismo banco.",
        "📄 Gestión total de documentos y requisitos del banco: acompañamiento de expertos hasta la firma final.",
      ],
    },
    {
      icon: BarChart3,
      title: "Leasing",
      subtitle: "Habitacional",
      impact: "Especialistas en cesión",
      description:
        "Conectamos propietarios y compradores que buscan aprovechar los beneficios financieros únicos del leasing habitacional como método de compra y venta de inmuebles en Colombia (cesión).",
      features: [
        "🏦 Enlace y acompañamiento completo en la cesión de leasing: te guiamos paso a paso con el banco para un proceso sin contratiempos.",
        "📊 Análisis financiero y requisitos del banco: te ayudamos a entender tu capacidad de pago y el proceso de aprobación.",
        "💡 Explicación clara de beneficios y obligaciones del leasing: ideal para compradores que buscan mejorar su flujo de efectivo.",
        "🏦 Simulación por banco y tipo de inmueble: para un estimado más realista según el tipo de crédito.",
        "✔ Tasas de interés en leasing, mejores que las de crédito tradicional.",
        "✔ Desembolso de crédito aproximadamente en 7 días (después de aprobado).",
      ],
    },
    {
      icon: Calculator,
      title: "Simulador de",
      subtitle: "Ahorro",
      impact: "Conoce tu ahorro en segundos",
      description:
        "Calcula en segundos cuánto te ahorras al comprar o vender un inmueble a través de una cesión de leasing en lugar de una compraventa tradicional.",
      features: [
        "💰 Cálculo instantáneo del ahorro total: conoce los valores que NO tendrás que pagar.",
        "📉 Comparación entre compraventa tradicional y cesión de leasing.",
        "Evita gastos de: ✔ Notaría ✔ Escrituración ✔ Estudio de títulos ✔ Registro ✔ Boleta Fiscal ✔ Retención en la fuente",
      ],
      href: "/credit-simulator", // ✅ credit-simulator/page.tsx
      cta: "Ir al simulador de ahorro",
    },
  ]

  return (
    <section className="py-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
          Nuestros<span className="text-accent"> Servicios</span>
        </h2>

        <p className="text-center text-foreground/60 mb-16 max-w-2xl mx-auto">
          Compra y venta con leasing, acompañamiento especializado y simulación de ahorro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            const isSimulator = Boolean(service.href && service.cta)

            return (
              <div
                key={index}
                className="group bg-card border border-accent/20 rounded-xl overflow-hidden hover:border-accent/50 transition-all hover:shadow-xl"
              >
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-b border-accent/20">
                  <Icon className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {service.title}
                  </h3>
                  <p className="text-accent font-semibold mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-sm font-semibold text-accent/80 italic">
                    “{service.impact}”
                  </p>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-foreground/70 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-accent font-bold text-lg leading-none">✓</span>
                        <span className="text-foreground/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* ✅ SOLO SIMULADOR TIENE BOTÓN */}
                  {isSimulator ? (
                    <Link
                      href={service.href!}
                      className="block w-full py-3 px-4 bg-accent text-white rounded-lg font-semibold text-center hover:bg-accent/90 transition-colors"
                    >
                      {service.cta}
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
