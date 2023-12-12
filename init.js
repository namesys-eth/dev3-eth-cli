import { ethers } from 'ethers'
import { execSync } from 'child_process'
import readline from 'readline'
import keygen from './utils/keygen.js'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// WELCOME!
console.log()
graphics.print(graphics.asciiArt, 'orange')
for (let i = 0; i < graphics.letter3.length; i++) {
    graphics.print(
        graphics.combineLetters(
            ' ',
            graphics.letterD[i],
            graphics.letterE[i],
            graphics.letterV[i],
            graphics.letter3[i],
            graphics.letter_[i],
            graphics.lettere[i],
            graphics.lettert[i],
            graphics.letterh[i]
        ), "green"
    )
}
graphics.print(graphics.initAsciiArt, 'orange')
console.log()

// Checks if the user is in a Git repo
function validateGitRepo() {
    return new Promise(async (resolve) => {
        const _isGitRepo = helper.isGitRepo()
        if (_isGitRepo) {
            const [_username, _branch, _githubKey] = await helper.getGitRepo()
            graphics.print('✅ Valid git repository', "lightgreen")
            const _synced = !await helper.isRemoteAhead(_branch)
            if (_synced) {
                graphics.print('✅ Remote tip is in sync', "lightgreen")
                resolve([
                    _isGitRepo,
                    _username,
                    _branch,
                    _githubKey,
                    _synced
                ])
            } else {
                graphics.print(`❗ Cannot initialise! Remote branch is ahead of local. please \'git merge\' or \'git pull\' to sync with remote tip and then try again`, "orange")
                graphics.print(`❌ Please \'git merge\' or \'git pull\' to sync with remote tip and then try again. Quitting...`, "orange")
                resolve([
                    _isGitRepo,
                    null,
                    null,
                    null,
                    null
                ])
                rl.close()
            }
        } else {
            graphics.print(`❌ Not a git repository! Please initialise and configure as git repository first. Quitting...`, "orange")
            graphics.print(`❗ PRE-REQUISITES:`, "orange")
            graphics.print(`👉 Please make sure that git repository is initialised and configured to push to remote branch on Github`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/get-started/using-git/about-git#github-and-the-command-line`, "skyblue")
            graphics.print(`👉 Please make sure that Github Pages (https://<githubID>.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            resolve([
                _isGitRepo,
                null,
                null,
                null,
                null
            ])
        }
    })
}

// Request Github ID for login
function requestGithubID(detectedUser) {
    return new Promise((resolve) => {
        rl.question(`⏰ Detected Github ID: ${detectedUser}. Confirm? [Y/N]: `, async (agree) => {
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

// Validates Github ID for login
function validateGithubID() {
    return new Promise((resolve) => {
        rl.question('⏰ Please enter Your Github ID: ', async (githubID) => {
            if (helper.isValidGithubID(githubID)) {
                const _githubIDExists = await helper.githubIDExists(githubID)
                if (_githubIDExists) {
                    graphics.print(`👋 Welcome, ${githubID}!`, "yellow")
                    const _ghpages = await helper.isGHPConfigured(githubID)
                    if (_ghpages) {
                        graphics.print(`✅ Github Page exists: https://${githubID}.github.io/`, "lightgreen")
                        graphics.print(`👉 Please make sure that Github Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "yellow")
                        graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
                        resolve(true) // Resolve the promise with true
                    } else {
                        graphics.print(`❌ Github Page DOES NOT exist: https://${githubID}.github.io/`, "orange")
                        graphics.print(`👉 Please make sure that Github Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
                        graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
                        graphics.print(`❌ Quitting...`, "orange")
                        resolve(false) // Resolve the promise with false
                    }
                } else {
                    graphics.print('❌ Github ID not found! Please try again OR press CTRL + C to exit', "orange")
                    resolve(await validateGithubID()) // Recursive call to prompt for GithubID again
                }
            } else {
                graphics.print('❌ Invalid Github ID! Please try again OR press CTRL + C to exit', "orange")
                resolve(await validateGithubID()) // Recursive call to prompt for GithubID again
            }
        })
    })
}

// Skip Github ID for login
function skipGithubID(detectedUser) {
    return new Promise(async (resolve) => {
        graphics.print(`🧪 Continuing with Github ID: ${detectedUser}`, "skyblue")
        graphics.print(`👋 Welcome, ${detectedUser}!`, "yellow")
        const _ghpages = await helper.isGHPConfigured(detectedUser)
        if (_ghpages) {
            graphics.print(`✅ Github Page exists: https://${detectedUser}.github.io/`, "lightgreen")
            graphics.print(`👉 Please make sure that Github Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "yellow")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            resolve(true)
        } else {
            graphics.print(`❌ Github Page DOES NOT exist: https://${detectedUser}.github.io/`, "orange")
            graphics.print(`👉 Please make sure that Github Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            graphics.print(`❌ Quitting...`, "orange")
            resolve(false)
        }
    })
}

const [isGitRepo, detectedUser, branch, githubKey, synced] = await validateGitRepo()
let userDetected = undefined
if (isGitRepo && detectedUser && synced) {
    userDetected = await requestGithubID(detectedUser)
}
const welcome = synced ? (userDetected ? await skipGithubID(detectedUser) : await validateGithubID(detectedUser)) : false

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

// Try Git Commit & Push
async function gitCommitPush(configured, branch, githubKey, detectedUser) {
    if (configured) {
        return new Promise(async (resolve) => {
            const timestamp = Date.now()
            graphics.print(`🧪 Detected branch: ${branch}`, "skyblue")
            if (githubKey) {
                graphics.print(`🧪 Detected signature fingerprint: ${githubKey}`, "skyblue")
                graphics.print(`🧪 Trying auto-update: git add verify.json .gitignore .nojekyll; git commit -S -m "dev3 init: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            } else {
                graphics.print(`🧪 Trying auto-update: git add verify.json .gitignore .nojekyll; git commit -m "dev3 init: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            }
            rl.question(`⏰ Try git commit & push? [Y/N]: `, async (attempt) => {
                if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
                    const _pushed = await helper.gitCommitPushConfig(branch, timestamp, githubKey)
                    resolve(_pushed)
                    graphics.print(`🎉 Successfully configured ENS-on-Github with DEV3.eth! To set signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npm run publish\'`, "lightgreen")
                    graphics.print(`👋 BYEE!`, "lightgreen")
                    rl.close()
                } else if (attempt.toLowerCase() === 'n' || attempt.toLowerCase() === 'no') {
                    resolve(false)
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await gitCommitPush(configured, branchgithubKey, detectedUser)) // Recursive call
                }
            })
        })
    }
}
const pushed = await gitCommitPush(configured, branch, githubKey, detectedUser)

