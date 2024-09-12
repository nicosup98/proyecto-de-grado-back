import { Client } from "@mysql"
import { Consumo } from "../models/Form.ts";

export function getConsumo(client: Client): Promise<Consumo[]>{
    return client.query("Select * from Consumo")
}