import { assert } from "@std/assert"
import {Consumo, ConsumoCalculado, Form} from "./models/Form.ts"
import { calcular } from "./services/calcularData.ts"
import dayjs from "@dayjs";
import {convert} from "@convert";
import { app } from "./main.ts"
import { connect } from "./db/Connection.ts";
import { Registro } from "./models/Registro.ts";
import { getRegistroById } from "./db/Registro.ts";
import { validarEmail } from "./utils/email.ts";


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


Deno.test("insertar formulario con puntos rojos", async () => {
    const formConPuntosRojos: Form = {
        cantidad_veces_inodoro: 2,
        email: "test_puntos_rojos@ejemplo.com",
        bloque_preferido: "A",
        genero: "masculino",
        tiempo_bebedero: 20,
        tiempo_lavamanos: 45,
        tipo_persona: "mantenimiento",
        punto_rojo: [
            {
                nombre: "Manguera jardín",
                tiempo_uso: 10,
                tipo: "manguera_litro_s"
            },
            {
                nombre: "Limpieza especial",
                tipo: "otro",
                tiempo_uso: 5,
                litros: 20
            }
        ]
    }

    const respuesta = await app.request("/send_form", {
        method: "POST",
        body: JSON.stringify(formConPuntosRojos),
    })

    const datos: ConsumoCalculado = await respuesta.json()

    console.log("Resultado del formulario con puntos rojos:", datos)
    assert(respuesta.status === 200)
    assert(datos.consumo_total.mensual > 0)
    assert(datos.consumo_total.semanal > 0)
    assert(datos.consumo_detalles.puntos_rojos > 0)
    assert(datos.tipo_usuario === "mantenimiento")
})




Deno.test("get registros",async ()=> {
    const client = await connect()
    const registro: Registro[] = await getRegistroById(2,client)

    console.log(registro)
    assert(registro[0].id)
    await client.close()
})



Deno.test('e2e resultados/email',async ()=> {
    const resp = await app.request('/resultados/email',{
        method: 'POST',
        body: 'damiconicola98@gmail.com'
    })

    const data = await resp.json()
    assert(resp.status === 200)
    assert(data.length > 0)
    console.log(data)
})

Deno.test('validación de correos electrónicos', () => {
  const correosValidos = [
    'usuario@ejemplo.com',
    'usuario.nombre@dominio.co',
    'usuario+etiqueta@ejemplo.com',
    'usuario123@subdominio.ejemplo.com'
  ];

  const correosInvalidos = [
    'usuarioejemplo.com',
    'usuario@',
    '@ejemplo.com',
    'usuario@ejemplo',
    'usuario@ejemplo..com',
    'usuario@.com',
    'usuario@.@lo',
    'usuario@.com._co',
    'usuario@ejemplo_com',
    'usuario@ejemplo.com..co',
    'para nada un email'
    
  ];

  console.log('Probando correos válidos:');
  correosValidos.forEach(correo => {
    console.log(`${correo}: ${validarEmail(correo)}`);
    assert(validarEmail(correo), `El correo ${correo} debería ser válido`);
  });

  console.log('\nProbando correos inválidos:');
  correosInvalidos.forEach(correo => {
    console.log(`${correo}: ${validarEmail(correo)}`);
    assert(!validarEmail(correo), `El correo ${correo} debería ser inválido`);
  });
});



Deno.test('pruebas de inyección SQL', async () => {
  const casosDePrueba = [
    "usuario@ejemplo.com' OR '1'='1",
    "usuario@ejemplo.com'; DROP TABLE registros; --",
    "usuario@ejemplo.com' UNION SELECT * FROM usuarios; --",
    "usuario@ejemplo.com' AND 1=0 UNION ALL SELECT * FROM información_schema.tables; --",
    "' OR '1'='1",
    "admin@ejemplo.com' --",
    "usuario@ejemplo.com'; INSERT INTO usuarios (nombre, contraseña) VALUES ('hacker', '123456'); --",
    "usuario@ejemplo.com' OR 1=1; --",
    "usuario@ejemplo.com' AND 1=1; --",
    "usuario@ejemplo.com' WAITFOR DELAY '0:0:10'--",
  ];

  for (const emailMalicioso of casosDePrueba) {
    const respuesta = await app.request('/resultados/email', {
      method: 'POST',
      body: emailMalicioso
    });
    
    const resultado = await respuesta.json();
    
    console.log(`Prueba con: ${emailMalicioso}`);
    console.log('Resultado de la consulta:', resultado);
    
    // Validamos que el resultado de la petición sea un error
    assert(respuesta.status === 400, `El estado de la respuesta debería ser 400 para: ${emailMalicioso}`);
    assert(resultado.error === "Email no válido", `El mensaje de error debería indicar que el email no es válido para: ${emailMalicioso}`);
  }
});






