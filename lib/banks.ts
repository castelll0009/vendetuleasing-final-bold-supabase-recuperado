export type BankId = "davivienda" | "bancolombia"

export type Bank = {
  id: BankId
  name: string
  logo: string
  infoUrl: string
  simulatorUrl: string
}

export const BANKS: Bank[] = [
  {
    id: "davivienda",
    name: "Davivienda",
    logo: "/bank-exterior.png",
    infoUrl: "https://www.davivienda.com/personas/credito-de-vivienda-inmuebles/leasing-habitacional",
    simulatorUrl: "https://www.viviendacondavivienda.com/",
  },
  {
    id: "bancolombia",
    name: "Bancolombia",
    logo: "/bank-exterior.png",
    infoUrl: "https://www.bancolombia.com/personas/creditos/vivienda/leasing-habitacional",
    simulatorUrl: "https://www.bancolombia.com/personas/simuladores",
  },
]

export const BANK_MAP = Object.fromEntries(BANKS.map((b) => [b.id, b])) as Record<BankId, Bank>
