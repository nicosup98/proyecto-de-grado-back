import { Context, Hono } from "@hono/hono";
import { jwt,sign,verify as jwt_verify } from "@hono/hono/jwt"
import type { JwtVariables } from "@hono/hono/jwt"
import dayjs from "@dayjs"
import { jwt_secret, jwt_secret as secret} from "./utils/env.ts"
import { Form } from "./models/Form.ts";
import { calcular } from "./services/calcularData.ts"
import { connect } from "./db/Connection.ts"
import { insertRegistro } from "./db/Registro.ts"
import { hash,verify } from "@ts-rex/bcrypt"
import { getUserByCredentials } from "./db/Admin.ts"
import { getConsumo } from "./db/Consumo.ts";
const app = new Hono<{Variables: JwtVariables}>();



app.use("/admin/*",jwt({secret}))

app.get("/", (c: Context) => {
  return c.text("hello");
});

app.post("/send_form", async (c: Context) => {
  const body: Form = await c.req.json();
  const client = await connect()
  const [consumo] = await getConsumo(client)
  const resp = calcular(body,consumo)
  const db_resp = await insertRegistro(resp,client)
  await client.close()
  if(!db_resp.affectedRows) return c.text("fallo algo") 

  //ver consumo de agua por s para calcular las cosas
});


app.post("/resultados/email",async (c: Context)=> {
  const _email =  await c.req.text()
  //si el email esta registrado devuelve la data si no, devuelve 404 con body vacio
  return c.text("hello")
})

app.get("/reset_formulario",async c=> {
  const token = c.req.query("token")

  if(!token) {
    return c.text("token no valido",403)
  }
  try{
    await jwt_verify(token,jwt_secret)
  } catch(e) {
    console.error(e)
    return c.text("ocurrio un error",500)
  }
  
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


  return c.text(await sign({...admin, timeout: dayjs().add(30,"minute").format() },secret))

})

app.get("/admin/dshboard", async (c)=>{
  const payload = c.get("jwtPayload")
  
  //verificar con una funcion el timeout y redireccionar al login http 403
  if(dayjs().isAfter(dayjs(payload.timeout))){
    return c.text("sesion expirada",403)
  }
  const _refreshToken = await sign({...payload, timeout: dayjs().add(30,"minute").format()},secret) // pasar al front
  //consultar en bd la data
  return c.text("dashboard")
})

Deno.serve({ port: 4000 }, app.fetch);
