// components/landing/about-section.tsx
export function AboutSection() {
  return (
    <section
      id="quienes-somos"
      className="w-full border-t bg-muted/40"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            ¿Quiénes somos?
          </h2>
          <p className="text-muted-foreground text-base mb-4">
            Vende Tu Leasing es una plataforma especializada en la gestión y venta de inmuebles bajo esquema de leasing
            habitacional. Acompañamos a propietarios y compradores para que el proceso sea claro, seguro y eficiente.
          </p>
          <p className="text-muted-foreground text-base mb-4">
            Nuestro equipo está conformado por profesionales del sector financiero e inmobiliario, con experiencia en
            negociación de créditos, análisis de inmuebles y acompañamiento integral durante todo el proceso.
          </p>
          <p className="text-muted-foreground text-base">
            Nos enfocamos en que entiendas cada paso, desde la simulación del crédito hasta la firma del negocio, para que
            tomes decisiones informadas y obtengas el mejor beneficio posible de tu leasing.
          </p>
        </div>
      </div>
    </section>
  )
}
