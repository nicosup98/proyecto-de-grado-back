import { assert } from "@std/assert"
import {Consumo, Form} from "./models/Form.ts"
import { calcular } from "./services/calcularData.ts"
import dayjs from "@dayjs";
import {convert} from "@convert";
import { connect } from "./db/Connection.ts"
import { insertRegistro,getRegistroById } from "./db/Registro.ts"
import { Registro } from "./models/Registro.ts";
import { testClient } from "@hono/hono/testing"


const fakeForm: Form = {
    cantidad_veces_inodoro: 2,
    email: "test2@test.com",
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
    dispensador_litro_s: 0.3,
    lavamano_litro_s: 6 / convert(1,"minute").to("second"),
    manguera_litro_s: 1000 / convert(1,"hour").to("second"),
    poceta_litro_jalada: 6,
    regadera_litro_s: 8 / convert(1,"minute").to("second"),
    urinario_litro_jalada: 4
}

Deno.test("get registros",async ()=> {
    const client = await connect()
    const registro: Registro[] = await getRegistroById(2,client)

    console.log(registro)
    assert(registro[0].id)
    await client.close()
})

Deno.test("insert en db", async ()=> {
    const calculo = calcular(fakeForm,fakeConsumo)
    const client = await connect()
    const resultado = await insertRegistro(calculo,client)

    assert(resultado.affectedRows)

    console.log(resultado)
    await client.close()

})

Deno.test("test de calculo de gasto de agua",()=> {
    
    const resultado = calcular(fakeForm,fakeConsumo)
    assert(resultado.consumo_detalles.litros_inodoro === 6 * 2)
    assert(resultado.consumo_detalles.litros_lavamanos === 6 / convert(1,"minute").to("second") * 60)  
    assert(resultado.consumo_detalles.litros_bebedero === 30 * 0.3)
    console.log(resultado)
})

