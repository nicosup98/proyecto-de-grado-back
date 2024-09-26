import { Consumo, ConsumoCalculado, ConsumoDetalles, Form } from "../models/Form.ts";
import {convert} from "@convert"
export function calcular(
    data: Form,
    consumo: Consumo,
): ConsumoCalculado {
    const consumo_detalles: ConsumoDetalles = {
        litros_inodoro: consumo.poceta_litro_jalada * data.cantidad_veces_inodoro,
        litros_lavamanos: consumo.lavamano_litro_s * data.tiempo_lavamanos,
        litros_bebedero: consumo.bebedero_litro_s * data.tiempo_bebedero, // ver a que tiempo se convierte
        bloque_preferido: data.bloque_preferido ,
        litros_urinarios: consumo.urinario_litro_jalada *
            (data.cantidad_veces_urinario || 0),
        puntos_rojos: data.punto_rojo?.reduce((pv,cr) =>{
            if(cr.option === 'Otro') {
                return pv + (cr.value || 0)
            }
            return pv + (consumo[cr.name] * cr.value)


        },0) || //momentaneo para que no chille
            0, //agregar en el front una lista que ponga los posibles gastos de agua y si selecciona otro que agregue los litros de agua para asi hacer el calculo
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
            semanal: Number(consumo_total_semanal.toFixed(2)),
            mensual: Number((consumo_total_semanal * convert(1,"month").to("week")).toFixed(2))
        }
    };
}
