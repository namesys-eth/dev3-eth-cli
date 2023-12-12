import { ethers, SigningKey } from 'ethers'
import readline from 'readline'
import keygen from './utils/keygen.js'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import fs, { writeFileSync, readFileSync, existsSync } from 'fs'
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
graphics.print(graphics.publishAsciiArt, 'orange')
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
            graphics.print(`❌ Not a git repository! Please initialise and configure as git repository first, and then run \'npm run init\'. Quitting...`, "orange")
            graphics.print(`❗ PRE-REQUISITES:`, "orange")
            graphics.print(`👉 Please make sure that git repository is initialised and configured to push to remote branch on github`, "orange")
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
        rl.question('⏰ Please enter your Github ID: ', async (githubID) => {
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
                    graphics.print('❌ Github ID Not Found! Please try again OR press CTRL + C to exit', "orange")
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

// Define Records
let addr60 = [
    { ...constants.record },
    `.well-known/eth/dev3/${detectedUser}/addr/60.json`
]
let avatar = [
    { ...constants.record },
    `.well-known/eth/dev3/${detectedUser}/text/avatar.json`
]
let contenthash = [
    { ...constants.record },
    `.well-known/eth/dev3/${detectedUser}/contenthash.json`
]
/* Define more ENS Records here */

// Initiates writing ENS Records
async function writeRecords() {
    if (welcome) {
        return new Promise(async (resolve) => {
            graphics.print(`ℹ️  TIP: ENS Records can be added in the next step or manually updated in \'records.json\' file`, "skyblue")
            rl.question('⏰ Continue in next step? [Y] OR, Update Manually? [N]: ', async (auto) => {
                if (auto.toLowerCase() === 'y' || auto.toLowerCase() === 'yes') {
                    resolve(true)
                } else if (auto.toLowerCase() === 'n' || auto.toLowerCase() === 'no') {
                    rl.question(`⌛ Please manually edit record keys in \'records.json\' file, save them and then press ENTER: `, async (done) => {
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
async function write_addr60(_addr60_) {
    if (written) {
        return new Promise(async (resolve) => {
            rl.question('📝 Please enter your ETH address (addr/60) and then press ENTER: ', async (_addr60) => {
                if (_addr60) {
                    if (constants.addressRegex.test(_addr60.slice(2))) {  // strip '0x'
                        _addr60_[0].value = _addr60
                        resolve([true, _addr60_])
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await write_addr60()) // Recursive call
                    }
                } else {
                    _addr60_[0].value = null
                    resolve([true, _addr60_])
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve([false, _addr60_])
        })
    }
}
let [written_addr60, _addr60] = await write_addr60(addr60)
addr60 = _addr60
// Writes ENS Records: avatar
async function write_avatar(_avatar_) {
    if (written && written_addr60) {
        return new Promise(async (resolve) => {
            rl.question('📝 Please enter avatar URL (text/avatar) and then press ENTER: ', async (_avatar) => {
                if (_avatar) {
                    if (constants.urlRegex.test(_avatar)) {
                        _avatar_[0].value = _avatar
                        resolve([true, _avatar_])
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await write_avatar()) // Recursive call
                    }
                } else {
                    _avatar_[0].value = null
                    resolve([true, _avatar_])
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve([false, _avatar_])
        })
    }
}
let [written_avatar, _avatar] = await write_avatar(avatar)
avatar = _avatar
// Writes ENS Records: contenthash
async function write_contenthash(_contenthash_) {
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
                        _contenthash_[0].value = _contenthash
                        resolve([true, _contenthash_])
                    } else {
                        graphics.print('⛔ Bad Input! Resetting...', "orange")
                        resolve(await writeRecords()) // Recursive call
                    }
                } else {
                    _contenthash_[0].value = null
                    resolve([true, _contenthash_])
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            resolve([false, _contenthash_])
        })
    }
}
let [written_contenthash, _contenthash] = await write_contenthash(contenthash)
contenthash = _contenthash

// Confirms ENS Records
async function confirmRecords(detectedUser) {
    if (written && written_addr60 && written_avatar && written_contenthash) {
        return new Promise(async (resolve) => {
            rl.question('⏰ Confirm Records Update? [Y/N]: ', async (_write) => {
                if (_write.toLowerCase() === 'y' || _write.toLowerCase() === 'yes') {
                    graphics.print(`🧪 Processing...`, "skyblue")
                    let _buffer = JSON.parse(readFileSync(constants.records.all, 'utf-8'))
                    // addr60
                    if (addr60[0].value) {
                        const _file = await helper.createDeepFile(constants.records.addr60)
                        if (_file) writeFileSync(constants.records.addr60, JSON.stringify(addr60[0], null, 2))
                        _buffer.records.address.eth = addr60[0].value
                    }
                    // avatar
                    if (avatar[0].value) {
                        const _file = await helper.createDeepFile(constants.records.avatar)
                        if (_file) writeFileSync(constants.records.avatar, JSON.stringify(avatar[0], null, 2))
                        _buffer.records.text.avatar = avatar[0].value
                    }
                    // contenthash
                    if (contenthash[0].value) {
                        const _file = await helper.createDeepFile(constants.records.contenthash)
                        if (_file) writeFileSync(constants.records.contenthash, JSON.stringify(contenthash[0], null, 2))
                        _buffer.records.contenthash = contenthash[0].value
                    }
                    // githubid
                    _buffer.githubid = detectedUser
                    // signer
                    _buffer.signer = JSON.parse(readFileSync('verify.json', 'utf-8')).signer
                    writeFileSync(constants.records.all, JSON.stringify(_buffer, null, 2))
                    resolve(true)
                } else if (_write.toLowerCase() === 'n' || _write.toLowerCase() === 'no') {
                    graphics.print(`❌ Quitting...`, "orange")
                    resolve(false) // Recursive call
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await confirmRecords()) // Recursive call
                }
            })
        })
    } else {
        return new Promise(async (resolve) => {
            let _buffer = JSON.parse(readFileSync(constants.records.all, 'utf-8'))
            _buffer.githubid = detectedUser
            _buffer.signer = JSON.parse(readFileSync('verify.json', 'utf-8')).signer
            // Read from buffer
            addr60[0].value = _buffer.records.address.eth
            avatar[0].value = _buffer.records.text.avatar
            contenthash[0].value = _buffer.records.contenthash
            writeFileSync(constants.records.all, JSON.stringify(_buffer, null, 2))
            // addr60
            if (_buffer.records.address.eth) {
                const _file = await helper.createDeepFile(constants.records.addr60)
                if (_file) {
                    writeFileSync(constants.records.addr60, JSON.stringify(addr60[0], null, 2))
                } else {
                    resolve(false)
                }
            }
            // avatar
            if (_buffer.records.text.avatar) {
                const _file = await helper.createDeepFile(constants.records.avatar)
                if (_file) {
                    writeFileSync(constants.records.avatar, JSON.stringify(avatar[0], null, 2))
                } else {
                    resolve(false)
                }
            }
            // contenthash
            if (_buffer.records.contenthash) {
                const _file = await helper.createDeepFile(constants.records.contenthash)
                if (_file) {
                    writeFileSync(constants.records.contenthash, JSON.stringify(contenthash[0], null, 2))
                } else {
                    resolve(false)
                }
            }
            resolve(true)
        })
    }
}
let confirmed = await confirmRecords(detectedUser)

// Verifies ENS Records
async function verifyRecords() {
    if (confirmed) {
        return new Promise(async (resolve) => {
            let __addr60 = { ...constants.record }
            let __avatar = { ...constants.record }
            let __contenthash = { ...constants.record }
            if (existsSync(constants.records.all)) {
                let records = JSON.parse(readFileSync(constants.records.all, 'utf-8'))
                __addr60.value = records.records.address.eth || null
                __avatar.value = records.records.text.avatar || null
                __contenthash.value = records.records.contenthash || null
            }
            // validity flags
            var flag = {
                addr60: false,
                avatar: false,
                contenthash: false
            }
            // addr60
            if (__addr60.value && __addr60.value !== null && constants.addressRegex.test(__addr60.value.slice(2))) { // strip '0x'
                flag.addr60 = true
            } else if (!__addr60.value || __addr60.value === null) {
                flag.addr60 = true
                graphics.print('🧪 Empty \'addr60:\' value in \'records.json\'', "skyblue")
            } else {
                graphics.print('❗ Bad \'addr60:\' value in \'records.json\'', "orange")
            }
            // avatar
            if (__avatar.value && __avatar.value !== null && constants.urlRegex.test(__avatar.value)) {
                flag.avatar = true
            } else if (!__avatar.value || __avatar.value === null) {
                flag.avatar = true
                graphics.print('🧪 Empty \'avatar:\' value in \'records.json\'', "skyblue")
            } else {
                graphics.print('❗ Bad \'avatar:\' value in \'records.json\'', "orange")
            }
            // contenthash
            if (__contenthash.value &&
                __contenthash.value !== null &&
                (
                    constants.ipnsRegex.test(__contenthash.value.slice(7)) || // strip 'ipns://'
                    constants.ipfsRegexCID0.test(__contenthash.value.slice(7)) || // strip 'ipfs://'
                    constants.ipfsRegexCID0.test(__contenthash.value.slice(7)) || // strip 'ipfs://'
                    constants.onionRegex.test(__contenthash.value.slice(8)) // strip 'onion://'
                )
            ) {
                flag.contenthash = true
            } else if (!__contenthash.value || __contenthash.value === null) {
                flag.contenthash = true
                graphics.print('🧪 Empty \'contenthash:\' value in \'records.json\'', "skyblue")
            } else {
                graphics.print('❗ Bad \'contenthash:\' value in \'records.json\'', "orange")
            }
            /* add more ENS Records here */
            if (Object.values(flag).every(value => value === true)) {
                graphics.print(`✅ Records verified!`, "lightgreen")
                resolve(true)
            } else {
                graphics.print(`❗ Records failed verification!`, "orange")
                resolve(false)
            }
        })
    } else {
        return new Promise(async (resolve) => {
            graphics.print(`❗ Records failed to write due to unknown reason!`, "orange")
            graphics.print(`❌ Quitting...`, "orange")
            resolve(false)
            rl.close()
        })
    }
}
const verified = await verifyRecords()

// Signs ENS Records
async function signRecords(detectedUser, record, type) {
    if (record) {
        if (verified) {
            return new Promise(async (resolve) => {
                graphics.print(`✅ Signing Record: ${type}`, "skyblue")
                const _signed = helper.signRecord(
                    `https://${detectedUser}.github.io`,
                    '1',
                    '0x4675C7e5BaAFBFFbca748158bEcBA61ef0000000',
                    type,
                    record,
                    JSON.parse(readFileSync('verify.json', 'utf-8')).signer
                )
                resolve(_signed)
            })
        } else {
            return new Promise(async (resolve) => {
                graphics.print(`❌ Please fix the ${type} record & then re-try \'npm run publish\'. Quitting...`, "orange")
                resolve([null, null])
                rl.close()
            })
        }
    } else {
        return new Promise(async (resolve) => {
            graphics.print(`❎ Skipping Record: ${type}`, "skyblue")
            resolve([null, null])
            rl.close()
        })
    }
}

// Sign addr60
const [payload_addr60, signature_addr60] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync('records.json', 'utf-8')
    ).records.address.eth,
    'addr/60'
)
// Sign avatar
const [payload_avatar, signature_avatar] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync('records.json', 'utf-8')
    ).records.text.avatar,
    'text/avatar'
)
// Sign contenthash
const [payload_contenthash, signature_contenthash] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync('records.json', 'utf-8')
    ).records.contenthash,
    'contenthash'
)

// Gets status of CF approval
async function getStatus() {
    return new Promise(async (resolve) => {
        let _verify = JSON.parse(readFileSync('verify.json', 'utf-8'))
        if (!_verify.verified) {
            const response = await fetch(constants.validator)
            if (!response.ok) {
                graphics.print(`❌ Failed to connect to Cloudflare validator`, "orange")
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const json = await response.json()
            return json;
        }
        resolve()
    })
}
const status = await getStatus()

// Gets CF approval
async function validateWithCF() {
    if (status) {
        return new Promise(async (resolve) => {
            resolve()
        })
    } else {
        return new Promise(async (resolve) => {
            resolve()
        })
    }
}
const validated = await validateWithCF()

// Try Git Commit & Push
async function gitCommitPush(signed, branch, githubKey, detectedUser) {
    if (validated) {
        return new Promise(async (resolve) => {
            const timestamp = Date.now()
            graphics.print(`🧪 Detected branch: ${branch}`, "skyblue")
            if (githubKey) {
                graphics.print(`🧪 Detected signature fingerprint: ${githubKey}`, "skyblue")
                graphics.print(`🧪 Trying auto-update: git add verify.json .well-known; git commit -S -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            } else {
                graphics.print(`🧪 Trying auto-update: git add verify.json .well-known; git commit -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
            }
            rl.question(`⏰ Try git commit & push? [Y/N]: `, async (attempt) => {
                if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
                    const _pushed = await helper.gitCommitPushRecords(branch, timestamp)
                    resolve(_pushed)
                    graphics.print(`🎉 Successfully updated signed ENS Records with DEV3.eth! To check your signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npm run status\'`, "lightgreen")
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
const pushed = await gitCommitPush(validated, branch, githubKey, detectedUser)

