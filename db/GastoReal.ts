import { Client } from "@mysql";
import { GastoReal } from "../models/GastoReal.ts"

export function insertGastoReal(client: Client, gastoReal: GastoReal ) {
  return client.execute(`insert into Consumo_real(agua_comprada,agua_gastada,agua_recolectada,agua_suministrada,fecha)values (?,?,?,?,'${gastoReal.fecha}')`,[Number(gastoReal.agua_comprada),Number(gastoReal.agua_gastada),Number(gastoReal.agua_recolectada), Number(gastoReal.agua_suministrada)])
}

export function updateGastoReal(client: Client, gastoReal: GastoReal & {fecha: string}) {
  return client.execute(`update Consumo_real set agua_comprada=?,agua_gastada=?,agua_recolectada=?,agua_suministrada=?,fecha=STR_TO_DATE('${gastoReal.fecha}','%d-%m-%Y') where id=?`,[Number(gastoReal.agua_comprada),Number(gastoReal.agua_gastada),Number(gastoReal.agua_recolectada),Number(gastoReal.agua_suministrada),gastoReal.id])
}

export function getGastoReal(client: Client) {
  return client.query('SELECT * from Consumo_real order by fecha desc')
}

export function getGastoRealByMonths(client: Client, year = 2025) {
  return client.query(`select MONTH(cr.fecha)as mes_num,MONTHNAME(cr.fecha) as mes, sum(cr.agua_suministrada) as agua_suministrada,sum(cr.agua_gastada) as agua_gastada from Consumo_real cr where YEAR(DATE(cr.fecha)) = ${year} group by MONTH(cr.fecha ), MONTHNAME(cr.fecha) order by MONTH(cr.fecha) asc`)
}

export function getLimite(client: Client) {
  return client.query('select * from AvisoLimite where id =1')
}

export function getMesesAviso(client: Client, limite= 1000) {
  return client.query(`select year(cr.fecha) as anio, monthname(cr.fecha) as mes, MONTH(cr.fecha) as mes_number, sum(cr.agua_gastada) as gasto_agua from Consumo_real cr group by anio,mes_number, mes having sum(cr.agua_gastada) >= ${limite} order by mes_number, anio  asc`)
}