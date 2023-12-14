import readline from 'readline'
import keygen from './utils/keygen.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import ethers from 'ethers'
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
    

    // Check status
    
    
}