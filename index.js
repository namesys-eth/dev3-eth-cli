import { ethers } from 'ethers'
import readline from 'readline'
import keygen from './utils/keygen.js'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// WELCOME!
console.log()
for (let i = 0; i < graphics.letter3.length; i++) {
    console.log(
        graphics.combineLetters(
            graphics.letterD[i],
            graphics.letterE[i],
            graphics.letterV[i],
            graphics.letter3[i],
            graphics.letter_[i],
            graphics.lettere[i],
            graphics.lettert[i],
            graphics.letterh[i]
        )
    )
}
console.log()

// Checks if the user is in a Git repo
function validateGitRepo() {
    return new Promise(async (resolve) => {
        const _isGitRepo = helper.isGitRepo()
        const [_username, _branch, _githubKey] = await helper.getGitRepo()
        _isGitRepo ? graphics.print('✅ Valid Git Repository', "lightgreen") : ''
        resolve([
            _isGitRepo,
            _username,
            _branch,
            _githubKey
        ])
    })
}

// Request GitHub ID for login
function requestGithubID(detectedUser) {
    return new Promise((resolve) => {
        rl.question(`⏰ Detected GitHub ID: ${detectedUser}. Confirm? [Y/N]: `, async (agree) => {
            if (agree.toLowerCase() === 'y' || agree.toLowerCase() === 'yes') {
                resolve(true)
            } else if (agree.toLowerCase() === 'n' || agree.toLowerCase() === 'no') {
                resolve(false)
            } else {
                graphics.print('⛔ Bad Input', "orange")
                resolve(await requestGithubID(detectedUser)) // Recursive call
            }
        })
    })
}

// Validates GitHub ID for login
function validateGithubID() {
    return new Promise((resolve) => {
        rl.question('⏰ Please Enter Your GitHub ID: ', async (githubID) => {
            if (helper.isValidGithubID(githubID)) {
                const _githubIDExists = await helper.githubIDExists(githubID)
                if (_githubIDExists) {
                    graphics.print(`👋 Welcome, ${githubID}!`, "yellow")
                    resolve(true) // Resolve the promise with true
                } else {
                    graphics.print('❌ GitHub ID Not Found! Please try again OR press CTRL + C to exit', "red")
                    resolve(await validateGithubID()) // Recursive call to prompt for GithubID again
                }
            } else {
                graphics.print('❌ Invalid GitHub ID! Please try again OR press CTRL + C to exit', "red")
                resolve(await validateGithubID()) // Recursive call to prompt for GithubID again
            }
        })
    })
}

// Skip GitHub ID for login
function skipGithubID(detectedUser) {
    return new Promise((resolve) => {
        graphics.print(`🧪 Continuing with GitHub ID: ${detectedUser}`, "skyblue")
        graphics.print(`👋 Welcome, ${detectedUser}!`, "yellow")
        resolve(true)
    })
}

const [isGitRepo, detectedUser, branch, githubKey] = await validateGitRepo()
const userDetected = isGitRepo && detectedUser ? await requestGithubID(detectedUser) : graphics.print(`❌ Not a Git Repository. Please initialise and configure as Git repository. Quitting...`, "red")
const welcome = userDetected ? await skipGithubID(detectedUser) : await validateGithubID(detectedUser)

// Gets Signer Keypair
async function getSigner() {
    if (welcome) {
        return new Promise((resolve) => {
            rl.question('⏰ Enter Signing Key (optional; leaving this field empty will generate a new signing key): ', async (_signerKey) => {
                const signerKey = _signerKey.startsWith('0x') ? _signerKey.slice(2) : _signerKey
                if (helper.isValidSigner(signerKey)) {
                    graphics.print(`✅ Valid Signer Key`, "lightgreen")
                    const _keypair = keygen.PUBKEY(signerKey)
                    resolve(_keypair) // Resolve the promise
                } else if (!signerKey) {
                    graphics.print(`🧪 Generating New Signer Key...`, "skyblue")
                    const _keypair = await keygen.KEYGEN()
                    graphics.print(`✅ Successfully Generated New Signer Key!`, "lightgreen")
                    resolve(_keypair) // Resolve the promise
                } else {
                    graphics.print('❌ Invalid Signer Key! Please try again OR press CTRL + C to exit', "red")
                    resolve(await getSigner())
                }
            })
        })
    }
}
const keypair = await getSigner()

// Set Signer key
async function setKeypair(keypair) {
    if (keypair) {
        return new Promise(async (resolve) => {
            const _config = await helper.writeConfig(keypair)
            graphics.print(`✅ Signer written to .env & verify.json, and validated .gitignore`, "lightgreen")
            resolve(_config)
        })
    }
}
const configured = await setKeypair(keypair)

// Attempt Git Commit & Push
async function gitCommitPush(configured, branch, githubKey) {
    if (configured) {
        return new Promise(async (resolve) => {
            const timestamp = Date.now()
            graphics.print(`🧪 Detected branch: ${branch}`, "skyblue")
            if (githubKey) {
                graphics.print(`🧪 Detected Signed Commitment Scheme: ${githubKey}`, "skyblue")
                graphics.print(`🧪 Attempting auto-update: git add verify.json .gitignore; git commit -S -m "dev3.eth: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            } else {
                graphics.print(`🧪 Attempting auto-update: git add verify.json .gitignore; git commit -m "dev3.eth: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            }        
            rl.question(`⏰ Attempt Git Commit & Push? [Y/N]: `, async (attempt) => {
                if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
                    const _pushed = await helper.gitCommitPush(branch, timestamp)
                    resolve(_pushed)
                    console.log()
                    rl.close()
                } else if (attempt.toLowerCase() === 'n' || attempt.toLowerCase() === 'no') {
                    resolve(false)
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await gitCommitPush(configured, branch)) // Recursive call
                }
            })
        })
    }
}
const pushed = await gitCommitPush(configured, branch, githubKey)

