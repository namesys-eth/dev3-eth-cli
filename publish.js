import { ethers, SigningKey } from 'ethers'
import readline from 'readline'
import keygen from './utils/keygen.js'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import fs, { writeFileSync, readFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import { execSync } from 'child_process'
const require = createRequire(import.meta.url)
require('dotenv').config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// WELCOME!
console.log()
graphics.print(graphics.asciiArt, 'orange')
graphics.logo()
graphics.print(graphics.publishAsciiArt, 'orange')
console.log()

const [isGitRepo, detectedUser, branch, githubKey, synced] = await helper.validateGitRepo(rl)
let userDetected = undefined
if (isGitRepo && detectedUser && synced) {
    userDetected = await helper.requestGithubID(detectedUser, rl)
} else {
    graphics.print(`❌ Quitting...`, "orange")
    rl.close()
}
const welcome = synced ? (userDetected ? await helper.skipGithubID(detectedUser) : await helper.validateGithubID(rl)) : false

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

// Confirms ENS Records
async function confirmRecords(detectedUser) {
    if (welcome) {
        return new Promise(async (resolve) => {
            rl.question(`⏰ Please manually edit record keys in \'records.json\' file, save the file and then press ENTER: `, async (done) => {
                let _buffer = JSON.parse(readFileSync(constants.records.all, 'utf-8'))
                _buffer.githubid = detectedUser
                _buffer.signer = JSON.parse(readFileSync(constants.verify, 'utf-8')).signer
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
        })
    }
}
let confirmed = await confirmRecords(detectedUser)

// Verifies ENS Records
async function verifyRecords() {
    if (welcome && confirmed) {
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
    if (welcome && record) {
        if (verified) {
            return new Promise(async (resolve) => {
                graphics.print(`🧪 Signing Record: ${type}`, "skyblue")
                const _signed = helper.signRecord(
                    `https://${detectedUser}.github.io`,
                    '1',
                    '0x4675C7e5BaAFBFFbca748158bEcBA61ef0000000',
                    type,
                    record,
                    JSON.parse(readFileSync(constants.verify, 'utf-8')).signer
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
            graphics.print(`🚮 Skipping Record: ${type}`, welcome ? "skyblue" : "orange")
            resolve([null, null])
        })
    }
}

// Sign addr60
const [payload_addr60, signature_addr60] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync(constants.records.all, 'utf-8')
    ).records.address.eth,
    'addr/60'
)
// Sign avatar
const [payload_avatar, signature_avatar] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync(constants.records.all, 'utf-8')
    ).records.text.avatar,
    'text/avatar'
)
// Sign contenthash
const [payload_contenthash, signature_contenthash] = await signRecords(
    detectedUser,
    JSON.parse(
        readFileSync(constants.records.all, 'utf-8')
    ).records.contenthash,
    'contenthash'
)

// Gets status of CF approval
async function getStatus(detectedUser) {
    if (welcome) {
        return new Promise(async (resolve) => {
            let _verify = JSON.parse(readFileSync(constants.verify, 'utf-8'))
            let _buffer = JSON.parse(readFileSync(constants.records.all, 'utf-8'))
            if (!_verify.verified) {
                graphics.print(`🧪 Waiting for validation from Cloudflare...`, "skyblue")
                const _url = `${constants.validator}${detectedUser}`
                const response = await fetch(_url)
                if (!response.ok) {
                    graphics.print(`❗ Failed to connect to Cloudflare validator: error ${response.status}`, "orange")
                    graphics.print(`❌ Quitting...`, "orange")
                    rl.close()
                    resolve(false)
                }
                const verifier = await response.json()
                if (verifier.gateway === `${detectedUser}.github.io` && verifier.signer === _verify.signer) {
                    _verify.verified = true
                    _verify.accessKey = verifier.approval
                    _buffer.approval = verifier.approval
                    graphics.print(`✅ Validated Signer: ${_verify.signer}`, "lightgreen")
                    graphics.print(`🧪 Writing records to .well-known/eth/dev3/${detectedUser}...`, "skyblue")
                    // addr60
                    if (_buffer.records.address.eth) {
                        let _addr60 = JSON.parse(readFileSync(constants.records.addr60, 'utf-8'))
                        _addr60.signer = _verify.signer
                        _addr60.signature = signature_addr60
                        _addr60.approved = true
                        _addr60.approval = verifier.approval
                        writeFileSync(constants.records.addr60, JSON.stringify(_addr60, null, 2))
                    }
                    // avatar
                    if (_buffer.records.text.avatar) {
                        let _avatar = JSON.parse(readFileSync(constants.records.avatar, 'utf-8'))
                        _avatar.signer = _verify.signer
                        _avatar.signature = signature_avatar
                        _avatar.approved = true
                        _avatar.approval = verifier.approval
                        writeFileSync(constants.records.avatar, JSON.stringify(_avatar, null, 2))
                    }
                    // contenthash
                    if (_buffer.records.contenthash) {
                        let _contenthash = JSON.parse(readFileSync(constants.records.avatar, 'utf-8'))
                        _contenthash.signer = _verify.signer
                        _contenthash.signature = signature_contenthash
                        _contenthash.approved = true
                        _contenthash.approval = verifier.approval
                        writeFileSync(constants.records.contenthash, JSON.stringify(_contenthash, null, 2))
                    }
                } else {
                    graphics.print(`❗ Cloudflare validation failed: Signer DOES NOT match!`, "orange")
                    graphics.print(`❌ Quitting...`, "orange")
                    rl.close()
                    resolve(false)
                }
            } else {
                graphics.print(`🧪 Records already verified by Cloudflare...`, "skyblue")
                graphics.print(`🧪 Writing records to \'.well-known/eth/dev3/${detectedUser}\'...`, "skyblue")
            }
            writeFileSync(constants.verify, JSON.stringify(_verify, null, 2))
            writeFileSync(constants.records.all, JSON.stringify(_buffer, null, 2))
            let _container = `.well-known/eth/dev3/${detectedUser}`
            execSync(`rm -r ${_container}`)
            execSync(`mkdir -p ${_container}`)
            execSync(`cp -r records/* ${_container}`)
            resolve(true)
        })
    }
}
const validated = await getStatus(detectedUser)
await helper.gitCommitPush(validated, branch, githubKey, detectedUser, rl,
    'verify.json .gitignore .nojekyll',
    `🎉 Successfully updated ENS Records with dev3.eth! To check your signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npm run status\'`
)

