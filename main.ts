import { Context, Hono } from "@hono/hono";

const app = new Hono();

app.get("/", (c: Context) => {
  return c.text("hello");
});

app.post("/send_form", async (c: Context) => {
  const _body = await c.req.json();
  //ver consumo de agua por s para calcular las cosas
});

Deno.serve({ port: 4000 }, app.fetch);
