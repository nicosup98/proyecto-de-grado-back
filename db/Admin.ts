import { Client } from "@mysql"
import { Admin } from "../models/Admin.ts"

export function getUserByCredentials(adm: Admin,client: Client) {
    return client.query("SELECT * FROM Admin where email=? and password=?",[adm.username,adm.password])
}