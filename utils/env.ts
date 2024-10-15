import "@std/dotenv/load"

export function getEnvParam(key: string){
    return Deno.env.get(key) || ""
}

export const jwt_secret = getEnvParam("JWT_SECRET")
export const is_prod = getEnvParam('prod')
const deployed_front = getEnvParam('FRONT_URL') //cambiar cuando se despliegue
const deployed_back = getEnvParam('BACK_URL') //cambiar cuando se despliegue

export const front_url = is_prod?  deployed_front: 'http://localhost:5173' 
export const redirect_uri = is_prod? deployed_back : 'http://localhost:4000' 