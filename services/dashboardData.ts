import { Registro, RegistroByBloque, RegistroByTipo } from "../models/Registro.ts"




export function calculateDashboardInfo(registrosByMonth: Registro[],registrosByBloque: RegistroByBloque , registrosByTipo: RegistroByTipo ) {
  const consumo_total = registrosByMonth.reduce((pv,cv)=>cv.gasto_agua + pv,0)
  const inodoros = registrosByMonth.reduce((pv,cv)=>cv.litros_inodoros +pv,0 )
  const bebedero = registrosByMonth.reduce((pv,cv)=>cv.litros_bebederos + pv,0)
  const lavamanos = registrosByMonth.reduce((pv,cv)=> cv.litros_lavamanos +pv,0)
  const urinarios = registrosByMonth.reduce((pv,cv)=>cv.litros_urinarios + pv,0)
  const consumo_total_dispensador = [inodoros,bebedero,lavamanos,urinarios].flat().reduce((pv,cv)=>cv + pv,0)
  return {
    promedio_consumo: (consumo_total / registrosByMonth.length).toFixed(2),
    consumo_total,
    cantidad_personas: registrosByMonth.length,
    consumo_total_dispensador,
    consumo_dispensador: [
      {dispensador:'bebedero',consumo: bebedero},
      {dispensador:'inodoros',consumo: inodoros},
      {dispensador:'lavamanos',consumo: lavamanos},
      {dispensador:'urinarios',consumo: urinarios},
      {dispensador: 'otro', consumo: registrosByMonth.reduce((pv,cv)=>cv.litros_puntos_rojos + pv,0)}
    ],
    consumo_bloque: [
      {bloque:'A',consumo: registrosByBloque.A.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'B',consumo: registrosByBloque.B.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'C', consumo:registrosByBloque.C.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'D',consumo: registrosByBloque.D.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'E',consumo: registrosByBloque.E.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'F',consumo: registrosByBloque.F.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'G',consumo: registrosByBloque.G.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'cancha',consumo: registrosByBloque.cancha.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'rectorado',consumo: registrosByBloque.rectorado.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:'biblioteca',consumo: registrosByBloque.Biblioteca.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'vivero',consumo: registrosByBloque.Vivero.reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque:"centro de mantenimiento",consumo: registrosByBloque["Centro de mantenimiento"].reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'feria de comida',consumo: registrosByBloque["Feria de comida"].reduce((pv,cv)=> cv.gasto_agua +pv,0)},
      {bloque: 'otro',consumo: registrosByBloque.otro.reduce((pv,cv)=> cv.gasto_agua +pv,0)}
    ],
    consumo_tipo: [
      {tipo: 'estudiante',consumo: registrosByTipo.estudiante.reduce((pv,cv)=>cv.gasto_agua + pv,0)},
      {tipo: 'profesor',consumo: registrosByTipo.profesor.reduce((pv,cv)=>cv.gasto_agua + pv,0)},
      {tipo:'personal',consumo: registrosByTipo.personal.reduce((pv,cv)=>cv.gasto_agua + pv,0)},
      {tipo:'mantenimiento',consumo: registrosByTipo.mantenimiento.reduce((pv,cv)=>cv.gasto_agua + pv,0)},
      {tipo:'visitante',consumo: registrosByTipo.visitante.reduce((pv,cv)=>cv.gasto_agua + pv,0)},
    ]
  }
}