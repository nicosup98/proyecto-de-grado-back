export type Bloque = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "rectorado" | "cancha"
type Persona = "estudiante" | "profesor" | "empleado" | "empleado de mantenimiento" | "visitante"
type Genero = "masculino" | "femenino" | "otro"
/**
 * body del formulario
 */
export interface Form{
    email: string
    tiempo_lavamanos: number
    cantidad_veces_inodoro: number
    cantidad_veces_urinario?: number
    bloque_preferido?: Bloque
    tipo_persona: Persona
    genero: Genero
    punto_rojo?:PuntoRojo[]
}
/**
 * tabla de bd
 */
export interface Consumo {
    lavamano_litro_s: number
    poceta_litro_jalada:number
    regadera_litro_s: number
    dispensador_litro_s: number
    manguera_litro_s: number //mirar bien el nombre
    urinario_litro_jalada: number
    create_at: string
    updated_at: string
}


interface PuntoRojo {
    nombre: string,
    litros: number,
    tiempo_uso: number
}
