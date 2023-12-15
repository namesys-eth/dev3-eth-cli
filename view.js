import { execSync } from 'child_process'
import readline from 'readline'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import constants from './utils/constants.js'
import { ethers } from 'ethers'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

// main
export async function view() {

    // MAIN ============================================
    const space = `     `

    // Shows ENS Records
    async function show(githubID, provider) {
        if (helper.isValidGithubID(githubID)) {
            let domain = `${githubID}.dev3.eth`
            graphics.print(`🔎 Searching...`, 'skyblue')
            graphics.print(`${space}  DOMAIN: ${domain}`, "white")
            try { // Get Resolver
                const resolver = await provider.getResolver(domain)
                graphics.print(`${space}RESOLVER: ${resolver.address}`, "lightgreen")
            } catch {
                graphics.print(`${space}RESOLVER: NOT_SET`, "orange")
            }
            try { // Get addr60
                const addr60 = await provider.resolveName(domain)
                graphics.print(`${space} ADDRESS: ${addr60} [1]`, "lightgreen")
            } catch {
                graphics.print(`${space} ADDRESS: [1]`, "yellow")
            }
            try { // Get avatar
                const avatar = await resolver.getText('avatar')
                graphics.print(`${space}  AVATAR: ${avatar} [2]`, "lightgreen")
            } catch {
                graphics.print(`${space}  AVATAR: [2]`, "yellow")
            }
            try { // Get contenthash
                const contenthash = await resolver.getContentHash()
                graphics.print(`  CONTENTHASH: ${contenthash} [3]`, "lightgreen")
            } catch {
                graphics.print(`  CONTENTHASH: [3]`, "yellow")
            }
            return true
        } else {
            graphics.print(`❌ Bad Github ID! Quitting...`, "orange")
            return false
        }
    }

    // Debugs ENS Records
    async function debug() {
        rl.question('🚧 Debug ENS Record? (enter index [1/2/3/N]): ', async (debug) => {
            if (['1', '2', '3'].includes(debug)) {
                resolve(true)
            } else {
                graphics.print(`👋 BYEE!`, "lightgreen")
                resolve(null)
            }
        })
    }

    // Confirm Github ID
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

    // MAIN ============================================
    // Check status
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim()
    const username = remoteUrl.match(/github\.com[:/](\w+[-_]?\w+)/)[1]
    async function status(username, provider) {
        return new Promise(async (resolve) => {
            if (username) {
                rl.question(`⏰ Detected Github ID: ${username}. Confirm? [Y/N]: `, async (agree) => {
                    if (!agree || agree.toLowerCase() === 'y' || agree.toLowerCase() === 'yes') {
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

