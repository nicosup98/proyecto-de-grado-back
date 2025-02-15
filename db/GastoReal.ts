import { Client } from "@mysql";
import { GastoReal } from "../models/GastoReal.ts"
import dayjs from "@dayjs";

export function insertGastoReal(client: Client, gastoReal: GastoReal ) {
  return client.execute(`insert into Consumo_real(agua_comprada,agua_gastada,agua_recolectada,agua_suministrada,fecha)values (?,?,?,?,'${gastoReal.fecha}')`,[Number(gastoReal.agua_comprada),Number(gastoReal.agua_gastada),Number(gastoReal.agua_recolectada), Number(gastoReal.agua_suministrada)])
}

export function updateGastoReal(client: Client, gastoReal: GastoReal & {fecha: string}) {
  return client.execute(`update Consumo_real set agua_comprada=?,agua_gastada=?,agua_recolectada=?,agua_suministrada=?,fecha=STR_TO_DATE('${gastoReal.fecha}','%d-%m-%Y') where id=?`,[Number(gastoReal.agua_comprada),Number(gastoReal.agua_gastada),Number(gastoReal.agua_recolectada),Number(gastoReal.agua_suministrada),gastoReal.id])
}

export function getGastoReal(client: Client) {
  return client.query('SELECT * from Consumo_real')
}