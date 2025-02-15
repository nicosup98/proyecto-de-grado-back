export interface GastoReal {
  id?: number
  agua_comprada: number
  agua_suministrada: number
  agua_recolectada: number
  agua_gastada: number
  fecha: string
}

export type GastoRealPojo = Omit<GastoReal,'agua_suministrada' | 'fecha'>