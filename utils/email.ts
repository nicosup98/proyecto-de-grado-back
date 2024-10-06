import { verifyEmail } from '@devmehq/email-validator-js'

export async function validarEmail(email: string) {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    const emailVerification = await verifyEmail({emailAddress:email,timeout: 10000, verifyMx: true})
    return emailVerification.validFormat && emailVerification.validMx;
}