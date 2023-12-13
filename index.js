#!/usr/bin/env node
import { init } from "./init.js"
import { publish } from "./publish.js"
import graphics from './utils/graphics.js'
const arg = process.argv.slice(2)[0]
if (arg === "init") {
    init()
} else if (arg === "sign") {
    publish()
} else {
    // WELCOME!
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    console.log()
    graphics.print("👉 Please run `npx dev3 init` to initialise", "skyblue")
    graphics.print("👉 Please run `npx dev3 sign` to sign & publish your ENS records", "skyblue")
    graphics.print(" ◥ docs: https://dev3.eth.limo", "skyblue")
}
