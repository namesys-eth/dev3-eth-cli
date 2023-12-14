import { execSync } from 'child_process'
import readline from 'readline'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import constants from './utils/constants.js'
import { ethers } from 'ethers'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

async function show(githubID, provider) {
    if (helper.isValidGithubID(githubID)) {
        let domain = `${githubID}.dev3.eth`
        graphics.print(`🔎 Searching...`, 'skyblue')
        graphics.print(`     DOMAIN: ${domain}`, "white")
        try { // Get Resolver
            const resolver = await provider.getResolver(domain)
            graphics.print(`   RESOLVER: ${resolver.address}`, "lightgreen")
        } catch {
            graphics.print(`   RESOLVER: null`, "orange")
        }
        try { // Get addr60
            const addr60 = await provider.resolveName(domain)
            graphics.print(`    ADDRESS: ${addr60}`, "lightgreen")
        } catch {
            graphics.print(`    ADDRESS: null`, "yellow")
        }
        try { // Get avatar
            const avatar = await resolver.getText('avatar')
            graphics.print(`     AVATAR: ${avatar}`, "lightgreen")
        } catch {
            graphics.print(`     AVATAR: null`, "yellow")
        }
        try { // Get contenthash
            const contenthash = await resolver.getContentHash()
            graphics.print(`CONTENTHASH: ${contenthash}`, "lightgreen")
        } catch {
            graphics.print(`CONTENTHASH: null`, "yellow")
        }
        graphics.print(`👋 BYEE!`, "lightgreen")
        return true
    } else {
        graphics.print(`❌ Bad Github ID! Quitting...`, "orange")
        return false
    }
}

async function confirm(rl) {
    return new Promise(async (resolve) => {
        rl.question('⏰ Please enter your Github ID: ', async (githubID) => {
            if (helper.isValidGithubID(githubID)) {
                resolve(githubID)
            } else {
                graphics.print('⛔ Bad Input', "orange")
                resolve(null)
            }
        })
    })
}

export async function status() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // WELCOME!
    console.log()
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    graphics.print(graphics.viewAsciiArt, 'orange')
    console.log()

    // Set Alchemy
    let provider
    if (process.env.ALCHEMY_KEY) {
        provider = new ethers.AlchemyProvider(constants.NETWORK, process.env.ALCHEMY_KEY)
    } else {
        provider = new ethers.AlchemyProvider(constants.NETWORK, constants.ALCHEMY_KEY_DEFAULT)
    }

    // Check status
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim()
    const username = remoteUrl.match(/github\.com[:/](\w+[-_]?\w+)/)[1]
    async function status(username, provider) {
        return new Promise(async (resolve) => {
            if (username) {
                rl.question(`⏰ Detected Github ID: ${username}. Confirm? [Y/N]: `, async (agree) => {
                    if (agree.toLowerCase() === 'y' || agree.toLowerCase() === 'yes') {
                        await show(username, provider)
                        resolve(true)
                    } else if (agree.toLowerCase() === 'n' || agree.toLowerCase() === 'no') {
                        const askName = await confirm(rl)
                        if (askName) {
                            await show(askName, provider)
                        } else {
                            await status(username, provider) // Recursive call
                        }
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        await status(username, provider) // Recursive call
                    }
                })
            } else {
                const askName = await confirm(rl)
                if (askName) {
                    await show(askName, provider)
                } else {
                    await status(username, provider) // Recursive call
                }
            }
        })
    }
    await status(username, provider)
    rl.close()
}

