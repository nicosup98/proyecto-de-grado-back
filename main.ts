import { Context, Hono } from "@hono/hono";
import { jwt,sign } from "@hono/hono/jwt"
import type { JwtVariables } from "@hono/hono/jwt"
import dayjs from "@dayjs"

const app = new Hono<{Variables: JwtVariables}>();



app.use("/admin/*",(c,next)=>{
  const secret = "secret" // generar una key para el secret de jwt
  const jwtMidleware = jwt({secret})

  return jwtMidleware(c,next)
})

app.get("/", (c: Context) => {
  return c.text("hello");
});

app.post("/send_form", async (c: Context) => {
  const _body = await c.req.json();
  //ver consumo de agua por s para calcular las cosas
});

app.post("/resultados/email",async (c: Context)=> {
  const _email =  await c.req.text()
  //si el email esta registrado devuelve la data si no, devuelve 404 con body vacio
  return c.text("hello")
})

app.post("/login/admin",async (c: Context)=> {
  const admin: {username: string, password: string} = await c.req.json()
  const secret = "secret" // generar una key para el secret de jwt


  // verificar con query sql

  return c.text(await sign({...admin, timeout: dayjs().add(1,"hour").format() },secret,"RS256"))

})

app.get("/admin/dshboard", async (c)=>{
  const payload = c.get("jwtPayload")
  const token = "token" // colocar esto en un archivo y exportarlo para evitar repeticion
  //verificar con una funcion el timeout y redireccionar al login
  
  const _refreshToken = await sign({...payload, timeout: dayjs().add(1,"hour").format()},token)
  //consultar en bd la data
  return c.text("dashboard")
})

Deno.serve({ port: 4000 }, app.fetch);
