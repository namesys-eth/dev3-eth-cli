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
        if (_isGitRepo) {
            const [_username, _branch, _githubKey] = await helper.getGitRepo()
            graphics.print('✅ Valid Git Repository', "lightgreen")
            resolve([
                _isGitRepo,
                _username,
                _branch,
                _githubKey
            ])
        } else {
            graphics.print(`❌ Not a Git Repository! Please initialise and configure as Git repository, then run \'npm run init\'. Quitting...`, "red")
            graphics.print(`❗ PRE-REQUISITES:`, "orange")
            graphics.print(`👉 Please make sure that Git repository is initialised and configured to push to remote branch on GitHub`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/get-started/using-git/about-git#github-and-the-command-line`, "skyblue")
            graphics.print(`👉 Please make sure that GitHub Pages (https://<githubID>.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            resolve([
                _isGitRepo,
                null,
                null,
                null
            ])
        }
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
                    const _ghpages = await helper.isGHPConfigured(githubID)
                    if (_ghpages) {
                        graphics.print(`✅ GitHub Page exists: https://${githubID}.github.io/`, "lightgreen")
                        graphics.print(`👉 Please make sure that GitHub Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "yellow")
                        graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
                        resolve(true) // Resolve the promise with true
                    } else {
                        graphics.print(`❌ GitHub Page DOES NOT exist: https://${githubID}.github.io/`, "red")
                        graphics.print(`👉 Please make sure that GitHub Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
                        graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
                        graphics.print(`❌ Quitting...`, "red")
                        resolve(false) // Resolve the promise with false
                    }
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
    return new Promise(async (resolve) => {
        graphics.print(`🧪 Continuing with GitHub ID: ${detectedUser}`, "skyblue")
        graphics.print(`👋 Welcome, ${detectedUser}!`, "yellow")
        const _ghpages = await helper.isGHPConfigured(detectedUser)
        if (_ghpages) {
            graphics.print(`✅ GitHub Page exists: https://${detectedUser}.github.io/`, "lightgreen")
            graphics.print(`👉 Please make sure that GitHub Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "yellow")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            resolve(true)
        } else {
            graphics.print(`❌ GitHub Page DOES NOT exist: https://${detectedUser}.github.io/`, "red")
            graphics.print(`👉 Please make sure that GitHub Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            graphics.print(`❌ Quitting...`, "red")
            resolve(false)
        }
    })
}

const [isGitRepo, detectedUser, branch, githubKey] = await validateGitRepo()
let userDetected = undefined
if (isGitRepo && detectedUser) {
    userDetected = await requestGithubID(detectedUser)
}
const welcome = userDetected ? await skipGithubID(detectedUser) : await validateGithubID(detectedUser)

// Gets status of CF approval
async function getStatus() {
    if (welcome) {
        return new Promise((resolve) => {
            resolve()
        })
    }
}
const status = await getStatus()

// Gets CF approval
async function verifyWithCF() {
    if (status) {
        return new Promise(async (resolve) => {
            resolve()
        })
    }
}
const verified = await verifyWithCF()

// Signs ENS Records
async function signRecords() {
    if (status) {
        return new Promise(async (resolve) => {
            resolve()
        })
    }
}
const signed = await signRecords()

// Attempt Git Commit & Push
async function gitCommitPush(signed, branch, githubKey, detectedUser) {
    if (signed) {
        return new Promise(async (resolve) => {
            const timestamp = Date.now()
            graphics.print(`🧪 Detected Branch: ${branch}`, "skyblue")
            if (githubKey) {
                graphics.print(`🧪 Detected Signature Fingerprint: ${githubKey}`, "skyblue")
                graphics.print(`🧪 Attempting auto-update: git add verify.json .well-known; git commit -S -m "dev3.eth: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            } else {
                graphics.print(`🧪 Attempting auto-update: git add verify.json .well-known; git commit -m "dev3.eth: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            }
            rl.question(`⏰ Attempt Git Commit & Push? [Y/N]: `, async (attempt) => {
                if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
                    const _pushed = await helper.gitCommitPushRecords(branch, timestamp)
                    resolve(_pushed)
                    graphics.print(`🎉 Successfully Configured ENS-on-GitHub with dev3.eth! To set signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npm run publish\'`, "lightgreen")
                    graphics.print(`👋 BYEE!`, "lightgreen")
                    rl.close()
                } else if (attempt.toLowerCase() === 'n' || attempt.toLowerCase() === 'no') {
                    resolve(false)
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await gitCommitPushRecords(signed, branch, githubKey, detectedUser)) // Recursive call
                }
            })
        })
    }
}
const pushed = await gitCommitPush(signed, branch, githubKey, detectedUser)

