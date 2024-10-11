import { verifyEmail } from '@devmehq/email-validator-js'

import { createGoogleOAuthConfig } from '@deno/kv-oauth'
import { getEnvParam } from "./env.ts";

export const googleOauthConfig = createGoogleOAuthConfig({
    redirectUri: getEnvParam('prod') ? 'https://nicosup98-proyecto-de-86.deno.dev/oauth/google/callback' : 'http://localhost:4000/oauth/google/callback',
    scope: "https://www.googleapis.com/auth/userinfo.email"
})


export async function validarEmail(email: string) {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    const emailVerification = await verifyEmail({emailAddress:email,timeout: 10000, verifyMx: true})
    return emailVerification.validFormat && emailVerification.validMx;
}