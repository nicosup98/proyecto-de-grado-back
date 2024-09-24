from denoland/deno:debian

expose 4000

workdir /app

user deno

copy . .

run deno cache main.ts

cmd ["run", "-REN", "main.ts"]

