"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, PiggyBank, Landmark } from "lucide-react";

/* ======================================================
UTILIDADES
====================================================== */

const formatCurrency = (value: number) =>
  value.toLocaleString("es-CO", { maximumFractionDigits: 0 });

const parseCurrency = (value: string) =>
  Number(value.replace(/\./g, "").replace(/,/g, "")) || 0;

/* ======================================================
BANCOS (REUTILIZABLES EN PROPIEDADES)
====================================================== */

const banks = [
  {
    name: "Davivienda",
    logo: "/banks/davivienda.png",
    infoUrl:
      "https://www.davivienda.com/wps/portal/personas/nuevo/personas/creditos/leasing-habitacional",
    simulatorUrl:
      "https://www.davivienda.com/wps/portal/personas/nuevo/personas/simuladores",
  },
  {
    name: "Bancolombia",
    logo: "/banks/bancolombia.png",
    infoUrl:
      "https://www.bancolombia.com/personas/creditos/leasing-habitacional",
    simulatorUrl: "https://www.bancolombia.com/personas/simuladores",
  },
];

/* ======================================================
COMPONENTE PRINCIPAL
====================================================== */

export default function CreditSimulatorPage() {
  const [tab, setTab] = useState<"credit" | "savings">("credit");
  const [propertyValue, setPropertyValue] = useState("");

  const value = parseCurrency(propertyValue);

  /* ======================================================
SIMULADOR DE CRÉDITO / LEASING (BÁSICO)
====================================================== */

  const [term, setTerm] = useState("15");
  const [rate, setRate] = useState("12");
  const [creditResult, setCreditResult] = useState<number | null>(null);

  const calculateCredit = () => {
    const months = Number(term) * 12;
    const monthlyRate = Number(rate) / 100 / 12;
    const cuota =
      (value * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    setCreditResult(cuota);
  };

  /* ======================================================
SIMULADOR DE AHORRO (DIFERENCIAL)
⚠ VALORES ESTIMADOS – AJUSTABLES
====================================================== */

  const buyerSavings = {
    estudioTitulos: value * 0.002,
    notaria: value * 0.003,
    registro: value * 0.005,
    estampillas: value * 0.003,
  };

  const sellerSavings = {
    retencionFuente: value * 0.01,
    boletaFiscal: value * 0.01,
  };

  const totalBuyer = Object.values(buyerSavings).reduce((a, b) => a + b, 0);
  const totalSeller = Object.values(sellerSavings).reduce((a, b) => a + b, 0);
  const totalSavings = totalBuyer + totalSeller;

  return (
    <main className="container mx-auto px-4 py-12 pt-20 max-w-6xl">
      {/* ================= HEADER ================= */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simulador de <span className="text-accent">crédito y ahorro</span>
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Descubre cuánto paga el comprador y cuánto se ahorran comprador y
          vendedor al realizar la operación en el <strong>mismo banco</strong>{" "}
          mediante
          <strong> leasing habitacional</strong>.
        </p>
      </div>

      {/* ================= INPUT GLOBAL ================= */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Valor del inmueble</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Ingresa el valor del inmueble</Label>
          <Input
            placeholder="300.000.000"
            value={propertyValue}
            onChange={(e) =>
              setPropertyValue(formatCurrency(parseCurrency(e.target.value)))
            }
          />
        </CardContent>
      </Card>

      {/* ================= TABS ================= */}
      <div className="flex justify-center gap-4 mb-10">
        <Button
          variant={tab === "credit" ? "default" : "outline"}
          onClick={() => setTab("credit")}
        >
          Simulador de crédito / leasing
        </Button>
        <Button
          variant={tab === "savings" ? "default" : "outline"}
          onClick={() => setTab("savings")}
        >
          Simulador de ahorro
        </Button>
      </div>

      {/* ================= CRÉDITO ================= */}
      {tab === "credit" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Calculator className="text-accent" /> Crédito / Leasing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Plazo (años)</Label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
            <div>
              <Label>Tasa anual estimada (%)</Label>
              <Input value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <Button onClick={calculateCredit} className="w-full">
              Calcular cuota estimada
            </Button>

            {creditResult && (
              <p className="text-3xl font-bold text-accent text-center mt-6">
                Cuota estimada: ${formatCurrency(creditResult)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= AHORRO ================= */}
      {tab === "savings" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SavingsCard title="Ahorro del comprador" items={buyerSavings} />
            <SavingsCard title="Ahorro del vendedor" items={sellerSavings} />
          </div>

          <Card className="mt-10 border-accent">
            <CardContent className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                Ahorro total de la operación
              </p>
              <p className="text-4xl font-bold text-accent">
                ${formatCurrency(totalSavings)}
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm text-center">
            ⚠ Los valores presentados son estimados y aproximados. Están sujetos
            a cambios según la normatividad vigente y políticas de cada banco.
          </div>
        </>
      )}

      {/* ================= BANCOS ================= */}
      {/* <section className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Bancos con leasing habitacional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banks.map((bank) => (
            <Card key={bank.name} className="overflow-hidden">
              <CardHeader className="border-b bg-accent/5">
                <div className="flex items-center gap-3">
                  <Landmark className="text-accent" />
                  <CardTitle className="text-lg">{bank.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={bank.infoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      Información leasing {bank.name}
                    </a>
                  </Button>

                  <Button asChild className="w-full">
                    <a
                      href={bank.simulatorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      Simulador {bank.name}
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Abrirás los recursos oficiales del banco en una nueva pestaña.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}
    </main>
  );
}

/* ======================================================
COMPONENTES AUXILIARES
====================================================== */

function SavingsCard({
  title,
  items,
}: {
  title: string;
  items: Record<string, number>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <PiggyBank className="text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(items).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-2">
            <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            <span className="font-semibold">${formatCurrency(value)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
