#!/usr/bin/env node
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));
import {init} from "./init.js"
import {sign} from "./publish.js"
const arg = args._[0];
if(arg === "init"){
    init()
} else if(arg === "sign" )  {
    sign()
} else {
    console.log("Dev3, Please Run \n   > dev3 init \nOR\n   > dev3 sign\nVisit: https://dev3.eth.limo for docs.")
}