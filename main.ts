import { type Context, Hono } from "@hono/hono";
import { jwt,sign,verify as jwt_verify } from "@hono/hono/jwt"
import type { JwtVariables } from "@hono/hono/jwt"
import dayjs from "@dayjs"
import { front_url, jwt_secret as secret} from "./utils/env.ts"
import { Form, type GoogleAuthData } from "./models/Form.ts";
import { calcular } from "./services/calcularData.ts"
import { connect } from "./db/Connection.ts"
import { getRegistroByEmail, getTotalRegistros, getTotalRegistrosByBloque, getTotalRegistrosByTipo, insertRegistro } from "./db/Registro.ts"
import { verify } from "@ts-rex/bcrypt"
import { getUserByCredentials } from "./db/Admin.ts"
import { getConsumo } from "./db/Consumo.ts";
import { Registro, RegistroByBloque, RegistroByTipo } from "./models/Registro.ts";
import { cors } from '@hono/hono/cors'
import { validarEmail,googleOauthConfig } from "./utils/email.ts";
import { createHelpers } from '@deno/kv-oauth'
import { calculateDashboardInfo } from "./services/dashboardData.ts";
import { parseDate } from "./utils/date.ts";
const app = new Hono<{Variables: JwtVariables}>();

app.use('/*',cors({origin: '*'}))
app.use('/admin/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret
  })
  return jwtMiddleware(c, next)
})

app.get("/", (c: Context) => {
  return c.text("hello");
});

app.post("/send_form", async (c: Context) => {
  const client = await connect()
  try {
    const body: Form = await c.req.json();
    const [consumo] = await getConsumo(client)
    const resp = calcular(body,consumo)
    const db_resp = await insertRegistro(resp,client)
    if(!db_resp.affectedRows) return c.text("no se guardo el registro",500);

    return c.json(resp)

  } catch (error) {
    console.error(error)
    return c.text("ocurrion un error al guardar el registro",500)
  } finally {
    await client.close()

  }

  //ver consumo de agua por s para calcular las cosas
});


app.post("/resultados/email", async (c: Context) => {
  const email = await c.req.text()
  
  // Validación del email
  if(!(await validarEmail(email))) {
    return c.json({error: "Email no válido"}, 400)
  }

  const client = await connect()
  const resp: Registro[] = await getRegistroByEmail(email, client)
  const status = resp.length == 0 ? 404 : 200
  await client.close()
  return c.json(resp, status, {"Content-Type": "application/json"})
})

app.get("/reset_formulario",async c=> {
  const token = c.req.query("token")

  if(!token) {
    return c.text("token no valido",403)
  }
  try{
    await jwt_verify(token,secret)
  } catch(e) {
    console.error(e)
    return c.text("ocurrio un error al verificar el token",500)
  }
  
})
app.get('/oauth/google/callback', async (c: Context)=> {
  const { handleCallback } = createHelpers(googleOauthConfig)
  const {tokens} = await handleCallback(c.req.raw)
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{
    headers: { 
      Authorization: `Bearer ${tokens.accessToken}`
    }
  })
  const data:GoogleAuthData = await resp.json()
  const encode = btoa(data.email)
  
  return c.redirect(`${front_url}/?email=${encode}`) 
})
app.get('/oauth/google/login',async (c: Context)=> {
  const { signIn } = createHelpers(googleOauthConfig)
  const response = await signIn(c.req.raw)
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, 302);
})



app.post("/login/admin",async (c: Context)=> {
  const admin: {email: string, password: string} = await c.req.json()
  const client = await connect()

  
  const [adm_user] = await getUserByCredentials(admin,client)
  
  await client.close()
  if(!verify(admin.password,adm_user.password)) {
    return c.text("fallo al encontrar el usuario",500)
  }

  return c.text(await sign({...admin, password:"", timeout: dayjs().add(30,"minute").format() },secret))

})

app.get("/admin/dashboard", async (c)=>{
  const payload = c.get("jwtPayload")
  const client = await connect()
  //verificar con una funcion el timeout y redireccionar al login http 403
  if(dayjs().isAfter(dayjs(payload.timeout))){
    return c.text("sesion expirada",403)
  }
  const _refreshToken = await sign({...payload,password:"", timeout: dayjs().add(30,"minute").format()},secret) // pasar al front
  //consultar en bd la data
  const registros = await getTotalRegistros(client)
  const registros_persona:RegistroByTipo = {
    estudiante: await getTotalRegistrosByTipo(client,"estudiante"),
    mantenimiento: await getTotalRegistrosByTipo(client,"mantenimiento"),
    personal: await getTotalRegistrosByTipo(client,"personal"),
    profesor: await getTotalRegistrosByTipo(client,"profesor"),
    visitante: await getTotalRegistrosByTipo(client,"visitante")
  }
  const registros_bloque: RegistroByBloque = {
    "Centro de mantenimiento": await getTotalRegistrosByBloque(client,"Centro de mantenimiento"),
    A: await getTotalRegistrosByBloque(client,"A"),
    B: await getTotalRegistrosByBloque(client,"B"),
    C: await getTotalRegistrosByBloque(client,"C"),
    D: await getTotalRegistrosByBloque(client,"D"),
    E: await getTotalRegistrosByBloque(client,"E"),
    F: await getTotalRegistrosByBloque(client,"F"),
    G: await getTotalRegistrosByBloque(client,"G"),
    "Feria de comida": await getTotalRegistrosByBloque(client,"Feria de comida"),
    Biblioteca: await getTotalRegistrosByBloque(client,"Biblioteca"),
    cancha: await getTotalRegistrosByBloque(client,"cancha"),
    otro: await getTotalRegistrosByBloque(client,"otro"),
    rectorado: await getTotalRegistrosByBloque(client,"rectorado"),
    Vivero: await getTotalRegistrosByBloque(client,"Vivero")
  }
  client.close()

  const data = calculateDashboardInfo(registros,registros_bloque,registros_persona)
  return c.json({data,_refreshToken})
})

export {
  app
}

Deno.serve({ port: 4000 }, app.fetch);
