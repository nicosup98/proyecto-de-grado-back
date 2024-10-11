import { type Context, Hono } from "@hono/hono";
import { jwt,sign,verify as jwt_verify } from "@hono/hono/jwt"
import type { JwtVariables } from "@hono/hono/jwt"
import dayjs from "@dayjs"
import { isProd, jwt_secret as secret} from "./utils/env.ts"
import { Form, type GoogleAuthData } from "./models/Form.ts";
import { calcular } from "./services/calcularData.ts"
import { connect } from "./db/Connection.ts"
import { getRegistroByEmail, insertRegistro } from "./db/Registro.ts"
import { hash } from "@ts-rex/bcrypt"
import { getUserByCredentials } from "./db/Admin.ts"
import { getConsumo } from "./db/Consumo.ts";
import { Registro } from "./models/Registro.ts";
import { cors } from '@hono/hono/cors'
import { validarEmail,googleOauthConfig } from "./utils/email.ts";
import { createHelpers } from '@deno/kv-oauth'
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
    return c.text("ocurrio un error al verificar el jwt",500)
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
  const front_url = isProd? 'https://proyecto-de-grado-fawn.vercel.app' : 'http://localhost:5173'
  return c.redirect(`${front_url}?email=${encode}`) //cambiar cuando se despliegue
})
app.get('/oauth/google/login',async (c: Context)=> {
  const { signIn } = createHelpers(googleOauthConfig)
  const response = await signIn(c.req.raw)
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, 302);
})



app.post("/login/admin",async (c: Context)=> {
  const admin: {username: string, password: string} = await c.req.json()
  const client = await connect()
  admin.password = hash(admin.password)
  
  const [adm_user] = await getUserByCredentials(admin,client)
  await client.close()
  if(!adm_user) {
    return c.text("fallo algo",500)
  }


  return c.text(await sign({...admin, password:"", timeout: dayjs().add(30,"minute").format() },secret))

})

app.get("/admin/dashboard", async (c)=>{
  const payload = c.get("jwtPayload")
  
  //verificar con una funcion el timeout y redireccionar al login http 403
  if(dayjs().isAfter(dayjs(payload.timeout))){
    return c.text("sesion expirada",403)
  }
  const _refreshToken = await sign({...payload,password:"", timeout: dayjs().add(30,"minute").format()},secret) // pasar al front
  //consultar en bd la data
  return c.text("dashboard")
})

export {
  app
}

Deno.serve({ port: 4000 }, app.fetch);
