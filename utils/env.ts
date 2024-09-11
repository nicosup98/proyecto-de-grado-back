import "@std/dotenv/load"

export function getEnvParam(key: string){
    return Deno.env.get(key) || ""
}

export const jwt_secret = getEnvParam("JWT_SECRET")