import { readFileSync } from "node:fs"

const template = readFileSync(`${process.cwd()}/src/templates/login.html`, "utf-8")

export function loginEmail(loginLink: string) {
    return template.replace("{{LOGIN_LINK}}", loginLink)
}
