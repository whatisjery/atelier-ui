#!/usr/bin/env node

import { Command } from "commander"
import dotenv from "dotenv"
import packageJson from "../package.json"
import { addCommand } from "./addCommand"

dotenv.config({ path: [".env.local", ".env"] })

async function cliTool() {
    const program = new Command()
        .name("Atelier")
        .description("add items from registries to your project")
        .version(packageJson.version || "1.0.0", "-v, --version", "display the version number")

    program.addCommand(addCommand)
    program.parse()
}

cliTool()
