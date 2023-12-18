import readline from 'readline'
import constants from './utils/constants.js'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import { execSync } from 'child_process'
const require = createRequire(import.meta.url)
require('dotenv').config()

export async function sign() {

    // FUNC ============================================
    // Initiates writing ENS Records
    async function writeRecords(welcome) {
        if (welcome) {
            return new Promise(async (resolve) => {
                graphics.print(`ℹ️  TIP: ENS Records can be added in the next step or manually updated in \'records.json\' file`, "skyblue")
                rl.question('⏰ Continue in next step? [Y] OR, update manually? [N]: ', async (auto) => {
                    if (auto.toLowerCase() === 'y' || auto.toLowerCase() === 'yes') {
                        resolve(true)
                    } else if (auto.toLowerCase() === 'n' || auto.toLowerCase() === 'no') {
                        resolve(false)
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await writeRecords(welcome)) // Recursive call
                    }
                })
            })
        }
    }

    // Writes ENS Records: addr60
    async function write_addr60(_addr60_, welcome, written) {
        if (welcome && written) {
            return new Promise(async (resolve) => {
                rl.question('📝 Please enter your ETH address (address/60) and then press ENTER: ', async (_addr60) => {
                    if (_addr60) {
                        if (helper.isAddr(_addr60)) {  // strip '0x'
                            _addr60_[0].value = _addr60
                            resolve([true, _addr60_])
                        } else {
                            graphics.print('⛔ Bad Input', "orange")
                            resolve(await write_addr60(_addr60_, welcome, written)) // Recursive call
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

    // Writes ENS Records: avatar
    async function write_avatar(_avatar_, welcome, written, written_addr60) {
        if (welcome && written && written_addr60) {
            return new Promise(async (resolve) => {
                rl.question('📝 Please enter avatar URL (text/avatar) and then press ENTER: ', async (_avatar) => {
                    if (_avatar) {
                        if (helper.isURL(_avatar)) {
                            _avatar_[0].value = _avatar
                            resolve([true, _avatar_])
                        } else {
                            graphics.print('⛔ Bad Input', "orange")
                            resolve(await write_avatar(_avatar_, welcome, written, written_addr60)) // Recursive call
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

    // Writes ENS Records: contenthash
    async function write_contenthash(_contenthash_, welcome, written, written_addr60, written_avatar) {
        if (welcome && written && written_addr60 && written_avatar) {
            return new Promise(async (resolve) => {
                rl.question('📝 Please enter contenthash value and then press ENTER: ', async (_contenthash) => {
                    if (_contenthash) {
                        if (helper.isContenthash(_contenthash)) {
                            _contenthash_[0].value = _contenthash
                            resolve([true, _contenthash_])
                        } else {
                            graphics.print('⛔ Bad Input! Resetting...', "orange")
                            resolve(await write_contenthash(_contenthash_, welcome, written, written_addr60, written_avatar)) // Recursive call
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

    // Confirms ENS Records
    async function confirmRecords(detectedUser, written, written_contenthash, addr60, avatar, contenthash) {
        if (welcome && !written && !written_contenthash) {
            return new Promise(async (resolve) => {
                rl.question(`⏰ Please manually edit record keys in \'records.json\' file, save the file and then press ENTER: `, async (done) => {
                    let _buffer = JSON.parse(readFileSync(constants.record, 'utf-8'))
                    _buffer.githubid = detectedUser
                    _buffer.signer = JSON.parse(readFileSync(constants.verify, 'utf-8')).signer
                    // Read from buffer
                    addr60[0].value = _buffer.records.address.eth
                    avatar[0].value = _buffer.records.text.avatar
                    contenthash[0].value = _buffer.records.contenthash
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
        } else if (welcome && written && written_contenthash) {
            return new Promise(async (resolve) => {
                rl.question(`⏰ Please Confirm Records Update (press ENTER to confirm; CTRL + C to exit): `, async (done) => {
                    if (!done) {
                        let _buffer = JSON.parse(readFileSync(constants.record, 'utf-8'))
                        // Write to buffer
                        _buffer.githubid = detectedUser
                        _buffer.signer = JSON.parse(readFileSync(constants.verify, 'utf-8')).signer
                        _buffer.records.address.eth = addr60[0].value
                        _buffer.records.text.avatar = avatar[0].value
                        _buffer.records.contenthash = contenthash[0].value
                        writeFileSync(constants.record, JSON.stringify(_buffer, null, 2))
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
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        resolve(await confirmRecords(detectedUser, written, written_contenthash, addr60, avatar, contenthash)) // Recursive call
                    }
                })
            })
        }
    }

    // Verifies ENS Records
    async function verifyRecords(welcome, confirmed) {
        if (welcome && confirmed) {
            return new Promise(async (resolve) => {
                let __addr60 = { ...constants.recordContent }
                let __avatar = { ...constants.recordContent }
                let __contenthash = { ...constants.recordContent }
                if (existsSync(constants.record)) {
                    let records = JSON.parse(readFileSync(constants.record, 'utf-8'))
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
                if (__addr60.value && __addr60.value !== null && helper.isAddr(__addr60.value)) { // strip '0x'
                    flag.addr60 = true
                } else if (!__addr60.value || __addr60.value === null) {
                    flag.addr60 = true
                    graphics.print('🧪 Empty \'addr60:\' value in \'records.json\'', "skyblue")
                } else {
                    graphics.print('❗ Bad \'addr60:\' value in \'records.json\'', "orange")
                }
                // avatar
                if (__avatar.value && __avatar.value !== null && helper.isURL(__avatar.value)) {
                    flag.avatar = true
                } else if (!__avatar.value || __avatar.value === null) {
                    flag.avatar = true
                    graphics.print('🧪 Empty \'avatar:\' value in \'records.json\'', "skyblue")
                } else {
                    graphics.print('❗ Bad \'avatar:\' value in \'records.json\'', "orange")
                }
                // contenthash
                if (__contenthash.value && __contenthash.value !== null && helper.isContenthash(__contenthash.value)) {
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

    // Signs ENS Records
    async function signRecords(detectedUser, record, type, key, resolver, welcome, verified) {
        if (welcome && record) {
            if (verified) {
                return new Promise(async (resolve) => {
                    graphics.print(`🧪 Signing Record: ${type}`, "skyblue")
                    const _signed = helper.signRecord(
                        `https://${detectedUser}.github.io`,
                        '5',
                        resolver,
                        type,
                        helper.genExtradata(key, record),
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

    // Gets status of CF approval
    async function getStatus(detectedUser, welcome, payload) {
        if (welcome) {
            return new Promise(async (resolve) => {
                let _verify = JSON.parse(readFileSync(constants.verify, 'utf-8'))
                let _buffer = JSON.parse(readFileSync(constants.record, 'utf-8'))
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
                if (verifier.gateway === `${detectedUser}.github.io` && verifier.approvedFor === _verify.signer) {
                    _verify.verified = true
                    _verify.accessKey = verifier.approvalSig
                    _buffer.approval = verifier.approvalSig
                    graphics.print(`✅ Validated Signer: ${_verify.signer}`, "lightgreen")
                    graphics.print(`🧪 Writing records to .well-known/eth/dev3/${detectedUser}...`, "skyblue")
                    // addr60
                    if (_buffer.records.address.eth) {
                        let _addr60 = JSON.parse(readFileSync(constants.records.addr60, 'utf-8'))
                        _addr60.data = helper.encodeValue("address", _addr60.value, _verify.signer, signature_addr60, verifier.approvalSig)
                        _addr60.signer = _verify.signer
                        _addr60.payload = payload.addr60
                        _addr60.signature = signature_addr60
                        _addr60.approved = true
                        _addr60.approval = verifier.approvalSig
                        writeFileSync(constants.records.addr60, JSON.stringify(_addr60, null, 2))
                    }
                    // avatar
                    if (_buffer.records.text.avatar) {
                        let _avatar = JSON.parse(readFileSync(constants.records.avatar, 'utf-8'))
                        _avatar.data = helper.encodeValue("avatar", _avatar.value, _verify.signer, signature_avatar, verifier.approvalSig)
                        _avatar.signer = _verify.signer
                        _avatar.payload = payload.avatar
                        _avatar.signature = signature_avatar
                        _avatar.approved = true
                        _avatar.approval = verifier.approvalSig
                        writeFileSync(constants.records.avatar, JSON.stringify(_avatar, null, 2))
                    }
                    // contenthash
                    if (_buffer.records.contenthash) {
                        let _contenthash = JSON.parse(readFileSync(constants.records.contenthash, 'utf-8'))
                        _contenthash.data = helper.encodeValue("contenthash", _contenthash.value, _verify.signer, signature_contenthash, verifier.approvalSig)
                        _contenthash.signer = _verify.signer
                        _contenthash.payload = payload.contenthash
                        _contenthash.signature = signature_contenthash
                        _contenthash.approved = true
                        _contenthash.approval = verifier.approvalSig
                        writeFileSync(constants.records.contenthash, JSON.stringify(_contenthash, null, 2))
                    }
                } else {
                    graphics.print(`❗ Cloudflare validation failed: Signer DOES NOT match!`, "orange")
                    graphics.print(`❌ Quitting...`, "orange")
                    rl.close()
                    resolve(false)
                }
                writeFileSync(constants.verify, JSON.stringify(_verify, null, 2))
                writeFileSync(constants.record, JSON.stringify(_buffer, null, 2))
                let _container = `.well-known/eth/dev3/${detectedUser}`
                // Clean .well-known
                if (existsSync(_container)) {
                    execSync(`rm -r ${_container}`)
                }
                // Make .well-known
                execSync(`mkdir -p ${_container}`)
                // Copy Records to .well-known
                if (existsSync('records')) {
                    execSync(`cp -r records/* ${_container}`)
                }
                resolve(true)
            })
        } else {
            return new Promise(async (resolve) => {
                graphics.print(`❌ Quitting...`, "orange")
                rl.close()
                resolve(false)
            })
        }
    }

    // CLI
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // WELCOME!
    console.log()
    graphics.print(graphics.asciiArt, 'orange')
    graphics.logo()
    graphics.print(graphics.signAsciiArt, 'orange')
    console.log()

    // Check Git Repository
    const [isGitRepo, detectedUser, branch, githubKey, synced, status] = await helper.validateGitRepo(rl)
    let userDetected = undefined
    if (isGitRepo && detectedUser && synced) {
        userDetected = await helper.requestGithubID(detectedUser, rl)
    } else {
        graphics.print(`❌ Quitting...`, "orange")
        rl.close()
    }
    const welcome = synced ? (userDetected ? await helper.skipGithubID(detectedUser, constants.verify) : await helper.validateGithubID(rl, constants.verify)) : false

    // MAIN ============================================
    // Define Records
    let addr60 = [
        { ...constants.recordContent },
        `.well-known/eth/dev3/${detectedUser}/address/60.json`
    ]
    let avatar = [
        { ...constants.recordContent },
        `.well-known/eth/dev3/${detectedUser}/text/avatar.json`
    ]
    let contenthash = [
        { ...constants.recordContent },
        `.well-known/eth/dev3/${detectedUser}/contenthash.json`
    ]
    /* Define more ENS Records here */

    let written = await writeRecords(welcome)
    let [written_addr60, _addr60] = await write_addr60(addr60, welcome, written)
    addr60 = _addr60
    let [written_avatar, _avatar] = await write_avatar(avatar, welcome, written, written_addr60)
    avatar = _avatar
    let [written_contenthash, _contenthash] = await write_contenthash(contenthash, welcome, written, written_addr60, written_avatar)
    contenthash = _contenthash
    let confirmed = await confirmRecords(detectedUser, written, written_contenthash, addr60, avatar, contenthash)
    const verified = await verifyRecords(welcome, confirmed)
    // Sign addr60
    const [payload_addr60, signature_addr60] = await signRecords(
        detectedUser,
        JSON.parse(
            readFileSync(constants.record, 'utf-8')
        ).records.address.eth,
        'address/60',
        'address',
        constants.resolver,
        welcome,
        verified
    )
    // Sign avatar
    const [payload_avatar, signature_avatar] = await signRecords(
        detectedUser,
        JSON.parse(
            readFileSync(constants.record, 'utf-8')
        ).records.text.avatar,
        'text/avatar',
        'avatar',
        constants.resolver,
        welcome,
        verified
    )
    // Sign contenthash
    const [payload_contenthash, signature_contenthash] = await signRecords(
        detectedUser,
        JSON.parse(
            readFileSync(constants.record, 'utf-8')
        ).records.contenthash,
        'contenthash',
        'contenthash',
        constants.resolver,
        welcome,
        verified
    )
    const payload = {
        addr60: payload_addr60,
        avatar: payload_avatar,
        contenthash: payload_contenthash
    }
    const validated = await getStatus(detectedUser, welcome, payload)
    let success = await helper.gitCommitPush(status, validated, branch, githubKey, detectedUser, rl,
        'verify.json .gitignore .nojekyll .well-known index.htm* records*',
        `🎉 Successfully updated ENS Records with dev3.eth! To check your signed ENS Records for \'${detectedUser}.dev3.eth\', try \'npx dev3-eth view\' OR \'npm run view\'`
    )
    if (!success) rl.close()
}