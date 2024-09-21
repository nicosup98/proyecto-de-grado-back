import { assert } from "@std/assert"
import {Consumo, ConsumoCalculado, Form} from "./models/Form.ts"
import { calcular } from "./services/calcularData.ts"
import dayjs from "@dayjs";
import {convert} from "@convert";
import { app } from "./main.ts"
import { connect } from "./db/Connection.ts";
import { Registro } from "./models/Registro.ts";
import { getRegistroByEmail, getRegistroById } from "./db/Registro.ts";


const fakeForm: Form = {
    cantidad_veces_inodoro: 2,
    email: "test222@test.com",
    bloque_preferido: "B",
    genero: "masculino",
    tiempo_bebedero: 30,
    tiempo_lavamanos: 60,
    tipo_persona: "estudiante",
    cantidad_veces_urinario: 1,

} 

const fakeConsumo: Consumo = {
    create_at: dayjs().format(),
    updated_at: dayjs().format(),
    bebedero_litro_s: 0.3,
    lavamano_litro_s: 6 / convert(1,"minute").to("second"),
    manguera_litro_s: 1000 / convert(1,"hour").to("second"),
    poceta_litro_jalada: 6,
    regadera_litro_s: 8 / convert(1,"minute").to("second"),
    urinario_litro_jalada: 4
}



// Deno.test("insert en db", async ()=> {
//     const calculo = calcular(fakeForm,fakeConsumo)
//     const client = await connect()
//     const resultado = await insertRegistro(calculo,client)

//     assert(resultado.affectedRows)

//     console.log(resultado)
//     await client.close()

// })

Deno.test("test de calculo de gasto de agua",()=> {
    const fakeFormAlt: Form = {
        ...fakeForm,
        bloque_preferido: "G",
        genero: "femenino",
        email: "chikatestxd@test.com",
        cantidad_veces_urinario: 0
    }
  
    const resultado = calcular(fakeForm,fakeConsumo)
    const resultado2 = calcular(fakeFormAlt,fakeConsumo)
    assert(resultado.consumo_detalles.litros_inodoro === 6 * 2)
    assert(resultado.consumo_detalles.litros_lavamanos === 6 / convert(1,"minute").to("second") * 60)  
    assert(resultado.consumo_detalles.litros_bebedero === 30 * 0.3)
    
    assert(resultado2.consumo_detalles.litros_inodoro === 6 * 2)
    assert(resultado2.consumo_detalles.litros_lavamanos === 6 / convert(1,"minute").to("second") * 60)  
    assert(resultado2.consumo_detalles.litros_bebedero === 30 * 0.3)
    console.log({resultado,resultado2})
})

Deno.test('test calculo con puntos rojos',()=>{
    const fakeFormPR: Form = {
        ...fakeForm,
        tipo_persona:"mantenimiento",
        punto_rojo:[
            {
                nombre:"test",
                tiempo_uso: 4,
                tipo:"manguera_litro_s"
            },
            {
                nombre:'test 2',
                tipo: 'otro',
                tiempo_uso: 3,
                litros: 1
            }
        ]
    }

    const calculo = calcular(fakeFormPR,fakeConsumo)
    const pr_resultado = (fakeConsumo.manguera_litro_s * 4) + 1
    console.log(calculo)
    assert(calculo.consumo_detalles.puntos_rojos === pr_resultado)
})

Deno.test("send form test",async ()=>{

const fakeForm2: Form = {
    cantidad_veces_inodoro: 3,
    email: "test33@test.com",
    bloque_preferido: "B",
    genero: "femenino",
    tiempo_bebedero: 15,
    tiempo_lavamanos: 50,
    tipo_persona: "estudiante",

} 
    const resp = await app.request("/send_form",{
        method: "POST",
        body: JSON.stringify(fakeForm2),

    })

    const data: ConsumoCalculado = await resp.json()

    console.log(data)
    assert(resp.status === 200)
    assert(data.consumo_total.mensual)
    assert(data.consumo_total.semanal)


})

Deno.test("get registros",async ()=> {
    const client = await connect()
    const registro: Registro[] = await getRegistroById(2,client)

    console.log(registro)
    assert(registro[0].id)
    await client.close()
})

Deno.test('get registro por empail',async ()=> {
    const client = await connect()

    const registro = await getRegistroByEmail('damiconicola98@gmail.com',client)
    assert(registro[0]?.email === 'damiconicola98@gmail.com')
    await client.close()
    console.log(registro)
})

Deno.test('sql injection test', async ()=> {
    const client = await connect()
    const registro = await getRegistroByEmail(`" or 1=1`,client)
    await client.close()
    console.log(registro)
})

