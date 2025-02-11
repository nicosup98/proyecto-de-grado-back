import type { Bloque, Persona } from "./Form.ts";

/**
 * tabla de bd
 */
export interface Registro {
  id: number;
  email: string;
  gasto_agua: number;
  gasto_agua_semanal: number;
  litros_lavamanos: number;
  litros_urinarios: number;
  litros_inodoros: number;
  litros_puntos_rojos: number;
  litros_bebederos: number;
  bloque_preferido: Bloque;
}

export type RegistroByBloque = {
  [key in Bloque]: Registro[];
};

export type RegistroByTipo = {
  [key in Persona]: Registro[];
};
