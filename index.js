#!/usr/bin/env node
import { init } from "./init.js"
import { publish } from "./publish.js"
import graphics from './utils/graphics.js'
const arg = process.argv.slice(2)[0];
if (arg === "init") {
    init()
} else if (arg === "sign") {
    publish()
} else {
    console.log("Dev3, Please Run \n   > dev3 init \nOR\n   > dev3 sign\nVisit: https://dev3.eth.limo for docs.")
}
