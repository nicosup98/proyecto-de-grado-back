import { Client } from "@mysql";
import { GastoReal } from "../models/GastoReal.ts"

export function insertGastoReal(client: Client, gastoReal: GastoReal ) {
  return client.execute("insert into Consumo_real values (?,?,?,?,?)",[gastoReal.agua_comprada,gastoReal.agua_gastada,gastoReal.agua_recolectada, gastoReal.agua_suministrada,Temporal.Now.plainDateISO()])
}