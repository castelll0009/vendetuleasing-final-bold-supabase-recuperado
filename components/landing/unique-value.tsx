import Image from "next/image";
//deploy
export function UniqueValue() {
  const values = [
    {
      icon: "/iconos/ahorro.png",
      title: "Ahorro Real",
      description: "Para comprador y vendedor",
    },
    {
      icon: "/iconos/rapido.png",
      title: "Proceso Rápido",
      description: "Desembolso desde 8 días",
    },
    {
      icon: "/iconos/sin-costos.png",
      title: "Sin Costos Duplicados",
      description: "Reducción de gastos administrativos",
    },
    {
      icon: "/iconos/segura.png",
      title: "Transacción Segura",
      description: "Entre clientes del mismo banco",
    },
    {
      icon: "/iconos/asesoria.png",
      title: "Asesoría Experta",
      description: "Acompañamiento personalizado",
    },
    {
      icon: "/iconos/integral.png",
      title: "Solución Integral",
      description: "Todo en un solo lugar",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-foreground flex flex-wrap justify-center items-center gap-3">
          Lo que hace único a
          <span className="flex items-center gap-3 text-accent">
            <img
              src="/only-logo.png"
              alt="Logo Vende Tu Leasing"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
            />
            Vende Tu Leasing
          </span>
        </h2>
        <p className="text-center text-foreground/60 mb-12 max-w-2xl mx-auto">
          Descubre las ventajas competitivas que nos distinguen en el mercado de
          leasing habitacional
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-accent/20 hover:border-accent/40 bg-card transition-all hover:shadow-lg flex flex-col items-start"
            >
              <Image
                src={value.icon}
                alt={value.title}
                width={48}
                height={48}
                className="mb-4 text-accent"
              />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-foreground/70">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
