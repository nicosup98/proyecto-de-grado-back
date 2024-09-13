import { Client } from "@mysql";
import { ConsumoCalculado } from "../models/Form.ts"

export function getRegistroById(id: number, client: Client) {
    return client.query("SELECT * FROM Registro where id = ?",[id])
}

export function getRegistroByEmail(email: string, client: Client) {
    return client.query("SELECT * FROM Registro where email = ?",[email])
}

export function insertRegistro(data:ConsumoCalculado, client: Client ){
    return client.execute("INSERT into Registro(email,gasto_agua,bloque_preferido) VALUES(?,?,?)",[data.email,data.consumo_total,data.consumo_detalles.bloque_preferido])
}

export function deleteRegistro(id: number, client: Client) {
    return client.execute("DELETE from Registro where id=?",[id])
}