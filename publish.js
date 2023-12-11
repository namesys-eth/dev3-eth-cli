import { ethers, SigningKey } from 'ethers'
import readline from 'readline'
import keygen from './utils/keygen.js'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import fs, { writeFileSync, readFileSync, existsSync } from 'fs'

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
graphics.print(graphics.publishAsciiArt, 'orange')
console.log()

// Checks if the user is in a Git repo
function validateGitRepo() {
    return new Promise(async (resolve) => {
        const _isGitRepo = helper.isGitRepo()
        if (_isGitRepo) {
            const [_username, _branch, _githubKey] = await helper.getGitRepo()
            graphics.print('✅ Valid Git Repository', "lightgreen")
            const _synced = !await helper.isRemoteAhead(_branch)
            if (_synced) {
                graphics.print('✅ Remote Tip is in Sync', "lightgreen")
                resolve([
                    _isGitRepo,
                    _username,
                    _branch,
                    _githubKey,
                    _synced
                ])
            } else {
                graphics.print(`❗ Cannot publish! Remote branch is ahead of local. please \'git merge\' or \'git pull\' to sync with remote tip and then try again`, "orange")
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
            graphics.print(`❌ Not a Git Repository! Please initialise and configure as Git repository, then run \'npm run init\'. Quitting...`, "orange")
            graphics.print(`❗ PRE-REQUISITES:`, "orange")
            graphics.print(`👉 Please make sure that Git repository is initialised and configured to push to remote branch on GitHub`, "orange")
            graphics.print(` ◥ https://docs.github.com/en/get-started/using-git/about-git#github-and-the-command-line`, "skyblue")
            graphics.print(`👉 Please make sure that GitHub Pages (https://<githubID>.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
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
                        graphics.print(`❌ GitHub Page DOES NOT exist: https://${githubID}.github.io/`, "orange")
                        graphics.print(`👉 Please make sure that GitHub Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
                        graphics.print(` ◥ https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
                        graphics.print(`❌ Quitting...`, "orange")
                        resolve(false) // Resolve the promise with false
                    }
                } else {
                    graphics.print('❌ GitHub ID Not Found! Please try again OR press CTRL + C to exit', "orange")
                    resolve(await validateGithubID()) // Recursive call to prompt for GithubID again
                }
            } else {
                graphics.print('❌ Invalid GitHub ID! Please try again OR press CTRL + C to exit', "orange")
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
            graphics.print(`❌ GitHub Page DOES NOT exist: https://${detectedUser}.github.io/`, "orange")
            graphics.print(`👉 Please make sure that GitHub Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
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

// Define Records
let addr60 = [
    constants.record,
    `.well-known/eth/dev3/${detectedUser}/addr/60.json`
]
let avatar = [
    constants.record,
    `.well-known/eth/dev3/${detectedUser}/text/avatar.json`
]
let contenthash = [
    constants.record,
    `.well-known/eth/dev3/${detectedUser}/contenthash.json`
]
/* Define more ENS Records here */

// Initiates writing ENS Records
async function writeRecords() {
    if (welcome) {
        return new Promise(async (resolve) => {
            graphics.print(`ℹ️  TIP: ENS Records can be added in the next step or manually updated in their respective JSON files`, "skyblue")
            rl.question('⏰ Continue in next step? [Y] OR, Update Manually? [N]: ', async (auto) => {
                if (auto.toLowerCase() === 'y' || auto.toLowerCase() === 'yes') {
                    resolve(true)
                } else if (auto.toLowerCase() === 'n' || auto.toLowerCase() === 'no') {
                    rl.question(`⌛ Please manually edit \'value:\' key the JSON files, save them and then press ENTER: `, async (done) => {
                        resolve(false)
                    })
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await writeRecords()) // Recursive call
                }
            })
        })
    }
}
let written = await writeRecords()

// Writes ENS Records: addr60
async function write_addr60() {
    if (written) {
        return new Promise(async (resolve) => {
            rl.question('📝 Please enter your ETH address (addr/60) and then press ENTER: ', async (_addr60) => {
                if (_addr60) {
                    if (constants.addressRegex.test(_addr60.slice(2))) {  // strip '0x'
                        addr60[0].value = _addr60
                        resolve(true)
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await write_addr60()) // Recursive call
                    }
                } else {
                    addr60[0].value = null
                    resolve(true)
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
let written_addr60 = await write_addr60()

// Writes ENS Records: avatar
async function write_avatar() {
    if (written && written_addr60) {
        return new Promise(async (resolve) => {
            rl.question('📝 Please enter avatar URL (text/avatar) and then press ENTER: ', async (_avatar) => {
                if (_avatar) {
                    if (constants.urlRegex.test(_avatar)) {
                        avatar[0].value = _avatar
                        resolve(true)
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await write_avatar()) // Recursive call
                    }
                } else {
                    avatar[0].value = null
                    resolve(true)
                }
            })
        })
    }
}
let written_avatar = await write_avatar()

// Writes ENS Records: contenthash
async function write_contenthash() {
    if (written && written_addr60 && written_avatar) {
        return new Promise(async (resolve) => {
            rl.question('📝 Please enter your contenthash value and then press ENTER: ', async (_contenthash) => {
                if (_contenthash) {
                    if (
                        constants.ipnsRegex.test(_contenthash.slice(7)) || // strip 'ipns://'
                        constants.ipfsRegexCID0.test(_contenthash.slice(7)) || // strip 'ipfs://'
                        constants.ipfsRegexCID0.test(_contenthash.slice(7)) || // strip 'ipfs://'
                        constants.onionRegex.test(_contenthash.slice(8)) // strip 'onion://'
                    ) {
                        contenthash[0].value = _contenthash
                        resolve(true)
                    } else {
                        graphics.print('⛔ Bad Input! Resetting...', "orange")
                        resolve(await writeRecords()) // Recursive call
                    }
                } else {
                    contenthash[0].value = null
                    resolve(true)
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
let written_contenthash = await write_contenthash()

// Confirms ENS Records
async function confirmRecords() {
    if (written && written_addr60 && written_avatar && written_contenthash) {
        return new Promise(async (resolve) => {
            rl.question('⏰ Confirm Records Update? [Y/N]: ', async (_write) => {
                if (_write.toLowerCase() === 'y' || _write.toLowerCase() === 'yes') {
                    graphics.print(`🧪 Processing...`, "skyblue")
                    resolve(true)
                } else if (_write.toLowerCase() === 'n' || _write.toLowerCase() === 'no') {
                    graphics.print(`❌ Quitting...`, "orange")
                    resolve(false) // Recursive call
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await writeRecords()) // Recursive call
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
let confirmed = await confirmRecords()

// Verifies ENS Records
async function verifyRecords() {
    if (!confirmed && !written && !written_addr60 && !written_avatar && !written_contenthash) {
        return new Promise(async (resolve) => {
            const __addr60 = existsSync(constants.records.addr60) ? JSON.parse(readFileSync(constants.records.addr60, 'utf-8')) : constants.record
            const __avatar = existsSync(constants.records.avatar) ? JSON.parse(readFileSync(constants.records.avatar, 'utf-8')) : constants.record
            const __contenthash = existsSync(constants.records.contenthash) ? JSON.parse(readFileSync(constants.records.contenthash, 'utf-8')) : constants.record
            // validity flags
            var flag = {
                addr60: false,
                avatar: false,
                contenthash: false
            }
            // addr60
            if (__addr60 && __addr60.value !== null && constants.addressRegex.test(__addr60.value.slice(2))) { // strip '0x'
                flag.addr60 = true
            } else {
                graphics.print('❗ Bad Value in addr/60. Please check \'value:\' key in \'records/addr/60.json\'', "orange")
            }
            // avatar
            if (__avatar && __avatar.value !== null && constants.urlRegex.test(__avatar.value)) {
                flag.avatar = true
            } else {
                graphics.print('❗ Bad Value in text/avatar. Please check \'value:\' key in \'records/text/avatar.json\'', "orange")
            }
            // contenthash
            if (__contenthash &&
                __contenthash.value !== null &&
                (
                    constants.ipnsRegex.test(__contenthash.slice(7)) || // strip 'ipns://'
                    constants.ipfsRegexCID0.test(__contenthash.slice(7)) || // strip 'ipfs://'
                    constants.ipfsRegexCID0.test(__contenthash.slice(7)) || // strip 'ipfs://'
                    constants.onionRegex.test(__contenthash.slice(8)) // strip 'onion://'
                )
            ) {
                flag.contenthash = true
            } else {
                graphics.print('❗ Bad Contenthash Value. Please check \'value:\' key in \'records/contenthash.json\'', "orange")
            }
            /* add more ENS Records here */
            if (Object.values(flag).every(value => value === true)) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(true) // Skip verification
        })
    }
}
const verified = await verifyRecords()

// Signs ENS Records
async function signRecords() {
    if (verified) {
        return new Promise(async (resolve) => {
            graphics.print(`✅ Record Files Verified!`, "lightgreen")
            graphics.print(`🧪 Signing Your Records...`, "skyblue")
            const _signed = helper.signRecords()
            resolve(_signed)
            rl.close()
        })
    } else {
        return new Promise(async (resolve) => {
            graphics.print('❌ Please fix the Records files & then re-try \'npm run publish\'. Quitting...', "orange")
            resolve(false)
            rl.close()
        })
    }
}
const signed = await signRecords()

// Gets status of CF approval
async function getStatus() {
    if (signed) {
        return new Promise((resolve) => {
            resolve(true)
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
const status = await getStatus()

// Gets CF approval
async function validateWithCF() {
    if (status) {
        return new Promise(async (resolve) => {
            resolve(true)
        })
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
const validated = await validateWithCF()

// Attempt Git Commit & Push
async function gitCommitPush(signed, branch, githubKey, detectedUser) {
    if (validated) {
        return new Promise(async (resolve) => {
            const timestamp = Date.now()
            graphics.print(`🧪 Detected Branch: ${branch}`, "skyblue")
            if (githubKey) {
                graphics.print(`🧪 Detected Signature Fingerprint: ${githubKey}`, "skyblue")
                graphics.print(`🧪 Attempting auto-update: git add verify.json .well-known; git commit -S -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            } else {
                graphics.print(`🧪 Attempting auto-update: git add verify.json .well-known; git commit -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            }
            rl.question(`⏰ Attempt Git Commit & Push? [Y/N]: `, async (attempt) => {
                if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
                    const _pushed = await helper.gitCommitPushRecords(branch, timestamp)
                    resolve(_pushed)
                    graphics.print(`🎉 Successfully Updated Signed Records with DEV3.eth! To check your Signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npm run status\'`, "lightgreen")
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
    } else {
        return new Promise(async (resolve) => {
            resolve(false)
        })
    }
}
const pushed = await gitCommitPush(signed, branch, githubKey, detectedUser)

