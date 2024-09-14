import { Consumo, ConsumoCalculado, ConsumoDetalles, Form } from "../models/Form.ts";
import {convert} from "@convert"
export function calcular(
    data: Form,
    consumo: Consumo,
): ConsumoCalculado {
    const consumo_detalles: ConsumoDetalles = {
        litros_inodoro: consumo.poceta_litro_jalada * data.cantidad_veces_inodoro,
        litros_lavamanos: consumo.lavamano_litro_s * data.tiempo_lavamanos,
        litros_bebedero: consumo.dispensador_litro_s * data.tiempo_bebedero, // ver a que tiempo se convierte
        bloque_preferido: data.bloque_preferido || "ninguno",
        litros_urinarios: consumo.urinario_litro_jalada *
            (data.cantidad_veces_urinario || 0),
        puntos_rojos: data.punto_rojo?.reduce((pv,cr) => pv + (cr.litros * cr.tiempo_uso),0) ||
            0, //ver a que tiempo se cponvierte
    };

    const consumo_total_semanal = consumo_detalles.litros_bebedero +
    consumo_detalles.litros_inodoro +
    consumo_detalles.litros_lavamanos +
    consumo_detalles.litros_urinarios +
    consumo_detalles.puntos_rojos

    return {
        email: data.email,
        consumo_detalles,
        genero: data.genero,
        tipo_usuario: data.tipo_persona,
        consumo_total: {
            semanal: consumo_total_semanal,
            mensual: consumo_total_semanal * convert(1,"month").to("week")
        }
    };
}
