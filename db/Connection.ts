import { Client } from "@mysql"
import {getEnvParam } from "../utils/env.ts"
export function connect() {
    return new Client().connect({
        hostname: getEnvParam("DB_HOSTNAME"),
        password: getEnvParam("DB_PASSWORD"),
        port: Number(getEnvParam("DB_PORT")),
        username: getEnvParam("DB_USER"),
    })
}