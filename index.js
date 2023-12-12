import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
console.log(minimist, args)
import {init} from "./init.js"
import {sign} from "./publish.js"
if(args.init){
    init()
} else {
    sign()
}