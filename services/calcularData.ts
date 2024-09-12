import { Form } from "../models/Form.ts";
import { getConsumo } from "../db/Consumo.ts"
import { Client } from "@mysql";
export async function calcular(data: Form, client: Client) {
    const [consumo] = await getConsumo(client) // toma el indice 0 de la lista

    const result = {
        litros_inodoro: consumo.poceta_litro_jalada * data.cantidad_veces_inodoro,
        litros_lavamanos: consumo.lavamano_litro_s * data.tiempo_lavamanos,
    }


}