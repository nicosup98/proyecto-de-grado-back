export type Bloque = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "rectorado" | "cancha" | "Feria de comida" | "Centro de mantenimiento" | 'Vivero'
type Persona = "estudiante" | "profesor" | "personal" | "mantenimiento" | "visitante"
type Genero = "masculino" | "femenino" | "otro"

type RecordType = Record<string,any>
/**
 * body del formulario
 */
export interface Form{
    email: string
    tiempo_lavamanos: number
    cantidad_veces_inodoro: number
    cantidad_veces_urinario?: number,
    tiempo_bebedero: number
    bloque_preferido: Bloque
    tipo_persona: Persona
    genero: Genero
    punto_rojo?:PuntoRojo[]
}
/**
 * tabla de bd
 */
export interface Consumo extends RecordType {
    lavamano_litro_s: number
    poceta_litro_jalada:number
    regadera_litro_s: number
    bebedero_litro_s: number
    manguera_litro_s: number //mirar bien el nombre
    urinario_litro_jalada: number
    create_at: string
    updated_at: string
} 




interface PuntoRojo {
    nombre: string,
    tipo: string
    litros?: number,
    tiempo_uso: number
}

export interface ConsumoCalculado {
    email: string,
    genero: Genero;
    tipo_usuario: Persona
    consumo_detalles: ConsumoDetalles,
    consumo_total: {
        semanal: number,
        mensual: number
    }
}

export interface ConsumoDetalles {
    litros_inodoro: number;
    litros_lavamanos: number;
    litros_bebedero: number;
    bloque_preferido: Bloque;
    litros_urinarios: number;
    puntos_rojos: number

}
