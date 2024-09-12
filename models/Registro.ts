import type { Bloque } from "./Form.ts"

/**
 * tabla de bd
 */
export interface Registro {
    id: number
    email: string
    huella_total: number
    bloque_preferido: Bloque
}