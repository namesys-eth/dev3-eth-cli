#!/usr/bin/env node
import { init } from "./init.js"
import { sign } from "./sign.js"
import { view } from "./view.js"
import graphics from './utils/graphics.js'

// Check for command-line arguments
const args = process.argv.slice(2)
if (args[0] === "init") {
    init()
} else if (args[0] === "sign") {
    sign()
} else if (args[0] === "view") {
    view()
} else {
    // WELCOME!
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    console.log()
    graphics.print("👉 Please run 'npx dev3-eth init' (global install) or 'npm run init' (local install) to initialise", "skyblue")
    graphics.print("👉 Please run 'npx dev3-eth sign' (global install) or 'npm run sign' (local install) to sign & publish your ENS records", "skyblue")
    graphics.print("👉 Please run 'npx dev3-eth view' (global install) or 'npm run view' (local install) to view your ENS records", "skyblue")
    graphics.print(" ◥ docs: https://dev3.eth.limo", "skyblue")
}

// Determine which function to run based on the command-line argument
if (args.length > 1) {
    switch (args[1]) {
        case 'init':
            init()
            break
        case 'sign':
            sign()
            break
        case 'view':
            view()
            break
        default:
            console.log('Invalid function name (available functions: init, sign, view)')
    }
}
