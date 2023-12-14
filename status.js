import readline from 'readline'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import constants from './utils/constants.js'
import { ethers } from 'ethers'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

export async function status() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // WELCOME!
    console.log()
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    graphics.print(graphics.initAsciiArt, 'orange')
    console.log()

    // Check Git Repository
    const [isGitRepo, detectedUser, branch, githubKey, synced] = await helper.validateGitRepo(rl)
    let userDetected = undefined
    if (isGitRepo && detectedUser && synced) {
        userDetected = await helper.requestGithubID(detectedUser, rl)
    }
    const welcome = synced ? (userDetected ? await helper.skipGithubID(detectedUser, constants.verify) : await helper.validateGithubID(rl, constants.verify)) : false

    // Set Alchemy
    let provider
    if(process.env.ALCHEMY_KEY) {
        provider = new ethers.AlchemyProvider(constants.NETWORK, process.env.ALCHEMY_KEY)
    } else {
        provider = new ethers.AlchemyProvider(constants.NETWORK, constants.ALCHEMY_KEY_DEFAULT)
    }
    
    // Check status
    let domain = `${detectedUser}.dev3.eth`
    graphics.print(`🔎 Searching...`, 'skyblue')
    graphics.print(`       Name: ${domain}`, "white")
    try { // resolver
        const resolver = await provider.getResolver(domain)
        graphics.print(`   Resolver: ${resolver.address}`, "lightgreen")
    } catch {
        graphics.print(`   Resolver: null`, "orange")
    }
    try { // addr60
        const addr60 = await provider.resolveName(domain)
        graphics.print(`     Addr60: ${addr60}`, "lightgreen")
    } catch { 
        graphics.print(`    Address: null`, "yellow")
    }
    try { // avatar
        const avatar = await resolver.getText('avatar')
        graphics.print(`     Avatar: ${avatar}`, "lightgreen")
    } catch {  
        graphics.print(`     Avatar: null`, "yellow")
    }
    try { // contenthash
        const contenthash = await resolver.getContentHash()
        graphics.print(` Contenhash: ${contenthash}`, "lightgreen")
    } catch {  
        graphics.print(`Contenthash: null`, "yellow")
    }
    graphics.print(`👋 BYEE!`, "lightgreen")
    rl.close()
}