import { Client } from "@mysql";
import { ConsumoCalculado } from "../models/Form.ts"
import { Registro } from "../models/Registro.ts";

export function getRegistroById(id: number, client: Client) {
    return client.query("SELECT * FROM Registro where id = ?",[id])
}

export function getRegistroByEmail(email: string, client: Client): Promise<Registro[]> {
    return client.query(`SELECT * FROM Registro where email = '${email}'`,)
}

export function insertRegistro(data:ConsumoCalculado, client: Client ){
    return client.execute(`INSERT INTO Registro (email, tipo_usuario, genero, gasto_agua, bloque_preferido,gasto_agua_semanal, litros_inodoros, litros_lavamanos, litros_bebederos,litros_urinarios,litros_puntos_rojos) values ('${data.email}', '${data.tipo_usuario}', '${data.genero}', ?, '${data.consumo_detalles.bloque_preferido}', ?,?,?,?,?,?)`,[data.consumo_total.mensual,data.consumo_total.semanal,data.consumo_detalles.litros_inodoro,data.consumo_detalles.litros_lavamanos,data.consumo_detalles.litros_bebedero,data.consumo_detalles.litros_urinarios,data.consumo_detalles.puntos_rojos])
}

export function deleteRegistro(id: number, client: Client) {
    return client.execute("DELETE from Registro where id=?",[id])
}