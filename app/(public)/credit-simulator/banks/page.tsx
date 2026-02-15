import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Landmark, ExternalLink } from "lucide-react"

const BANKS = [
  {
    id: "davivienda",
    name: "Davivienda",
    logo: "/bank-exterior.png",
    infoUrl:
      "https://www.davivienda.com/personas/credito-de-vivienda-inmuebles/leasing-habitacional",
    simulatorUrl: "https://www.viviendacondavivienda.com/",
  },
  {
    id: "bancolombia",
    name: "Bancolombia",
    logo: "/bank-exterior.png",
    infoUrl:
      "https://www.bancolombia.com/personas/creditos/vivienda/leasing-habitacional",
    simulatorUrl: "https://www.bancolombia.com/personas/simuladores",
  },
]



export default function BanksPage() {
  return (
    <main className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
            Bancos — Leasing Habitacional
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accede a la información oficial y al simulador de cada banco. No comparamos tasas para mantener el foco en
            la propiedad y el banco asociado al leasing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {BANKS.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader className="border-b bg-accent/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/70 dark:bg-white/10 rounded-md p-2 border">
                      <img
                        src={bank.logo}
                        alt={bank.name}
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-xl">{bank.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{bank.subtitle}</p>
                    </div>
                  </div>
                  <Landmark className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {bank.highlights?.length ? (
                  <div>
                    <p className="text-sm font-medium mb-2">Lo que puedes hacer aquí:</p>
                    <ul className="space-y-1">
                      {bank.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-start text-sm text-muted-foreground gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* ✅ Dos botones (oficiales) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <a href={bank.infoUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2">
                      Información leasing {bank.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  <Button asChild className="w-full">
                    <a href={bank.simulatorUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2">
                      Simulador {bank.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Estos enlaces abren recursos oficiales del banco en una nueva pestaña.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-accent/5">
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-bold mb-4">¿Necesitas ayuda para elegir?</h2>
            <p className="text-muted-foreground mb-6">
              Te ayudamos a entender el proceso de cesión de leasing y qué requisitos suele pedir cada banco, sin
              comparaciones de tasa lado a lado.
            </p>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              Agendar asesoría
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
