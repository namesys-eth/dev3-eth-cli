import readline from 'readline'
import keygen from './utils/keygen.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

export async function init() {

    // FUNC ============================================
    // Gets Signer Keypair
    async function getSigner() {
        if (welcome && synced) {
            return new Promise((resolve) => {
                rl.question('⏰ Enter Signing key (optional; leaving this field empty will generate a new Signing key): ', async (_signerKey) => {
                    const signerKey = _signerKey.startsWith('0x') ? _signerKey.slice(2) : _signerKey
                    if (helper.isValidSigner(signerKey)) {
                        graphics.print(`✅ Valid Signer key`, "lightgreen")
                        const _keypair = keygen.PUBKEY(signerKey)
                        resolve(_keypair) // Resolve the promise
                    } else if (!signerKey) {
                        graphics.print(`🧪 Generating new Signer key...`, "skyblue")
                        const _keypair = await keygen.KEYGEN()
                        graphics.print(`✅ Successfully generated new Signer Key!`, "lightgreen")
                        resolve(_keypair) // Resolve the promise
                    } else {
                        graphics.print('❌ Invalid Signer key! Please try again OR press CTRL + C to exit', "orange")
                        resolve(await getSigner())
                    }
                })
            })
        }
    }

    // Sets Signer key
    async function setKeypair(keypair) {
        if (keypair) {
            return new Promise(async (resolve) => {
                const _config = await helper.writeConfig(keypair)
                graphics.print(`✅ Signer written to .env & verify.json, and validated .gitignore`, "lightgreen")
                resolve(_config)
            })
        }
    }

    // CLI
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // HISTORY
    const history = await helper.history()

    // WELCOME!
    console.log()
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    graphics.print(graphics.initAsciiArt, 'orange')
    console.log()
    graphics.print(`💎 ${history} subdomains minted so far!`, 'lightgreen')
    graphics.print(`🧪 (Re-)initialising your subdomain...`, 'skyblue')

    // Check Git Repository
    const [isGitRepo, detectedUser, branch, githubKey, synced, status] = await helper.validateGitRepo(rl)
    let userDetected = undefined
    if (isGitRepo && detectedUser && synced) {
        userDetected = await helper.requestGithubID(detectedUser, rl)
    }
    const welcome = synced ? (userDetected ? await helper.skipGithubID(detectedUser, '') : await helper.validateGithubID(rl, '')) : false
    const keypair = await getSigner()

    // MAIN ============================================
    // Generate Or Request Keypair
    const configured = await setKeypair(keypair)

    // Push to Github
    let success = await helper.gitCommitPush(status, configured, branch, githubKey, detectedUser, rl,
        'verify.json .gitignore .nojekyll records.json index.htm*',
        `🎉 Successfully configured ENS-on-Github with dev3.eth! To set signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npx dev3-eth sign\' OR \'npm run sign\'`
    )
    if (!success) rl.close()
}