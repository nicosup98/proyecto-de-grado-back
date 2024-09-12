import { Client } from "@mysql";
import { Form } from "../models/Form.ts"

export function getRegistroById(id: number, client: Client) {
    return client.query("SELECT * FROM Registro where id = ?",[id])
}

export function getRegistroByEmail(email: string, client: Client) {
    return client.query("SELECT * FROM Registro where email = ?",[email])
}

export function insertRegistro(data:Partial<Form>, client: Client ){
    return client.execute("INSERT into Registro(email,huella_total,bloque_preferido) VALUES(?,?,?)",[...Object.values(data)])
}

export function deleteRegistro(id: number, client: Client) {
    return client.execute("DELETE from Registro where id=?",[id])
}