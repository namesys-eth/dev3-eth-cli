import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import readline from 'readline'
import graphics from './utils/graphics.js'
import helper from './utils/helper.js'
import constants from './utils/constants.js'
import { ethers } from 'ethers'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

export async function view() {

    // MAIN ============================================
    const space = `     `

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

    // Shows ENS Records
    async function show(githubID, provider) {
        if (helper.isValidGithubID(githubID)) {
            let domain = `${githubID}.dev3.eth`
            graphics.print(`🔎 Searching...`, 'skyblue')
            graphics.print(`${space}  DOMAIN: ${domain}`, "white")
            let resolver
            let _error = {
                addr60: null,
                avatar: null,
                contenthash: null
            }
            try { // Get Resolver
                resolver = await provider.getResolver(domain)
                graphics.print(`${space}RESOLVER: ${resolver.address}`, "lightgreen")
            } catch {
                graphics.print(`${space}RESOLVER: NOT_SET`, "orange")
            }
            try { // Get addr60
                const addr60 = await provider.resolveName(domain)
                graphics.print(`${space} ADDRESS: ${addr60} [1]`, "lightgreen")
            } catch (error) {
                graphics.print(`${space} ADDRESS: ... [1]`, "yellow")
                _error.addr60 = error
            }
            try { // Get avatar
                const avatar = await resolver.getText('avatar')
                graphics.print(`${space}  AVATAR: ${avatar} [2]`, "lightgreen")
            } catch (error) {
                graphics.print(`${space}  AVATAR: ... [2]`, "yellow")
                _error.avatar = error
            }
            try { // Get contenthash
                const contenthash = await resolver.getContentHash()
                graphics.print(`  CONTENTHASH: ${contenthash} [3]`, "lightgreen")
            } catch (error) {
                graphics.print(`  CONTENTHASH: ... [3]`, "yellow")
                _error.contenthash = error
            }
            console.log()
            return _error
        } else {
            graphics.print(`❌ Bad Github ID! Quitting...`, "orange")
            return null
        }
    }

    // Views ENS Records
    async function status(username, provider, rl) {
        return new Promise(async (resolve) => {
            if (username) {
                let _error
                rl.question(`⏰ Detected Github ID: ${username}. Confirm? [Y/N]: `, async (agree) => {
                    if (!agree || agree.toLowerCase() === 'y' || agree.toLowerCase() === 'yes') {
                        _error = await show(username, provider)
                        resolve(_error)
                    } else if (agree.toLowerCase() === 'n' || agree.toLowerCase() === 'no') {
                        const askName = await confirm(rl)
                        if (askName) {
                            _error = await show(askName, provider)
                            resolve(_error)
                        } else {
                            await status(username, provider, rl) // Recursive call
                        }
                    } else {
                        graphics.print('⛔ Bad Input', "orange")
                        await status(username, provider, rl) // Recursive call
                    }
                })
            } else {
                const askName = await confirm(rl)
                let _error
                if (askName) {
                    _error = await show(askName, provider)
                    resolve(_error)
                } else {
                    await status(username, provider, rl) // Recursive call
                }
            }
        })
    }

    // Debugs ENS Records
    async function debug(rl, username, error) {
        return new Promise(async (resolve) => {
            rl.question('🚧 Debug ENS Records? [Y/N]: ', async (_debug) => {
                if (!_debug || _debug.toLowerCase() === 'y' || _debug.toLowerCase() === 'yes') {
                    graphics.print('🔎 Verifying Records...', "skyblue")
                    await verifyRecords(username, _debug)
                    let _url = `https://${username}.github.io/records.json`
                    let response = await fetch(_url)
                    let signer
                    let approval
                    if (!response.ok) {
                        graphics.print(`❗ [Fetch] Failed to fetch records file \'records.json\': error ${response.status}`, "orange")
                        resolve(await debug(rl, username, error))
                    } else {
                        graphics.print(`⬇️  [Fetch] Fetching records file: \'records.json\'`, "cyan")
                        const data = await response.json()
                        signer = data.signer
                        approval = data.approval
                    }
                    await verifyCloudflare(username, signer, approval, constants.approver)
                    rl.question('🚧 Enter [index] of record to debug? (enter index [1/2/3/N]): ', async (_index) => {
                        if (['1', '2', '3'].includes(_index)) {
                            let key
                            if (_index === '1') key = 'addr60'
                            if (_index === '2') key = 'avatar'
                            if (_index === '3') key = 'contenthash'
                            console.log('❗ [`LOG]: ', error[key])
                            resolve([_index, signer])
                        } else if (_index.toLowerCase() === 'n' || _index.toLowerCase() === 'no') {
                            graphics.print(`👋 OK, BYEE!`, "lightgreen")
                            resolve([null, signer])
                            rl.close()
                        } else {
                            graphics.print('⛔ Bad Input', "orange")
                            resolve(await debug(rl, username, error))
                        }
                    })
                } else if (_debug.toLowerCase() === 'n' || _debug.toLowerCase() === 'no') {
                    graphics.print(`👋 OK, BYEE!`, "lightgreen")
                    resolve([null, null])
                    rl.close()
                } else {
                    graphics.print('⛔ Bad Input', "orange")
                    resolve(await debug(rl, username, error))
                }
            })
        })
    }

    // Verifies ENS Records
    async function verifyRecords(username) {
        return new Promise(async (resolve) => {
            let __addr60 = { ...constants.recordContent }
            let __avatar = { ...constants.recordContent }
            let __contenthash = { ...constants.recordContent }
            const keys = [
                'address/60.json',
                'text/avatar.json',
                'contenthash.json'
            ]
            if (existsSync(constants.record)) {
                let records = JSON.parse(readFileSync(constants.record, 'utf-8'))
                __addr60.now = records.records.address.eth || null
                __avatar.now = records.records.text.avatar || null
                __contenthash.now = records.records.contenthash || null
            }
            for (var i = 0; i < keys.length; i++) {
                let _url = `https://${username}.github.io/.well-known/eth/dev3/${username}/${keys[i]}`
                let response = await fetch(_url)
                let test
                if (i === 0) test = __addr60.now || null
                if (i === 1) test = __avatar.now || null
                if (i === 2) test = __contenthash.now || null
                if (!response.ok && test === null) {
                    if (test === null) {
                        graphics.print(`⬇️  [Fetch] Skipping record file: ${keys[i]} [${i + 1}]`, "cyan")
                    } else {
                        graphics.print(`❗ [Fetch] Failed to fetch record file ${keys[i]}: error ${response.status} [${i + 1}]`, "red")
                    }
                } else {
                    const data = await response.json()
                    if (i === 0) __addr60.value = data.value || null
                    if (i === 1) __avatar.value = data.value || null
                    if (i === 2) __contenthash.value = data.value || null
                    graphics.print(`⬇️  [Fetch] Fetching record file: ${keys[i]} [${i + 1}]`, "cyan")
                }
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
                graphics.print(`🧪 Verified record file: address/60.json [1]`, "skyblue")
            } else if (!__addr60.value || __addr60.value === null) {
                flag.addr60 = true
                graphics.print('🧪 Empty \'addr60:\' value in \'records.json\' [1]', "skyblue")
            } else {
                graphics.print('❗ Bad \'addr60:\' value in \'records.json\' [1]', "orange")
            }
            // avatar
            if (__avatar.value && __avatar.value !== null && helper.isURL(__avatar.value)) {
                flag.avatar = true
                graphics.print(`🧪 Verified record file: text/avatar.json [2]`, "skyblue")
            } else if (!__avatar.value || __avatar.value === null) {
                flag.avatar = true
                graphics.print('🧪 Empty \'avatar:\' value in \'records.json\' [2]', "skyblue")
            } else {
                graphics.print('❗ Bad \'avatar:\' value in \'records.json\' [2]', "orange")
            }
            // contenthash
            if (__contenthash.value && __contenthash.value !== null && helper.isContenthash(__contenthash.value)) {
                flag.contenthash = true
                graphics.print(`🧪 Verified record file: contenthash.json [3]`, "skyblue")
            } else if (!__contenthash.value || __contenthash.value === null) {
                flag.contenthash = true
                graphics.print('🧪 Empty \'contenthash:\' value in \'records.json\' [3]', "skyblue")
            } else {
                graphics.print('❗ Bad \'contenthash:\' value in \'records.json\' [3]', "orange")
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
    }

    // Verifies Records Signature
    async function verifySignature(username, index, signer) {
        return new Promise(async (resolve) => {
            let key
            let type
            if (index === 1) {
                key = 'address'
                type = 'address/60'
            }
            if (index === 2) {
                key = 'avatar'
                type = 'text/avatar'
            }
            if (index === 3) {
                key = 'contenthash'
                type = 'contenthash'
            }
            let _url = `https://${username}.github.io/.well-known/eth/dev3/${username}/${type}.json`
            let response = await fetch(_url)
            let value
            let signature
            if (!response.ok) {
                graphics.print(`❗ [Signature] Failed to fetch records file \'${type}.json\': error ${response.status}`, "orange")
                resolve(true)
            } else {
                const data = await response.json()
                value = data.value
                signature = data.signature
                const payload = await helper.payloadRecord(
                    `https://${username}.github.io`,
                    '5',
                    constants.resolver,
                    type,
                    helper.genExtradata(key, value),
                    signer
                )
                const _signer = ethers.verifyMessage(payload, signature)
                if (_signer === signer) {
                    graphics.print(`✅ Verified Signature for: ${type}`, "lightgreen")
                    resolve(true)
                } else {
                    graphics.print(`❗ Bad \'signature:\' in \'${type}.json\'`, "orange")
                    resolve(true)
                }
            }
        })
    }

    // Verifies Cloudflare approval
    async function verifyCloudflare(username, signer, approval, approver) {
        const payload = await helper.payloadCloudflare(
            `https://${username}.github.io`,
            '5',
            constants.resolver,
            signer
        )
        const _signer = ethers.verifyMessage(payload, approval)
        if (_signer === approver) {
            graphics.print(`✅ Verified Cloudflare Validation`, "lightgreen")
        } else {
            graphics.print(`❗ Bad Cloudflare Signature`, "orange")
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
    let error = await status(username, provider, rl)
    async function verifyAndDebug() {
        // Verify record files & Cloudflare approval
        let [_debug, signer] = await debug(rl, username, error);
        // Verify Signatures
        if (_debug && _debug !== null) {
            const trigger = await verifySignature(username, Number(_debug), signer);
            if (!trigger) {
                graphics.print(`🤞 HOPE IT HELPED!`, "lightgreen")
                rl.close()
            } else {
                graphics.print('🧪 Continuing de-bugger...', "skyblue")
                await verifyAndDebug()
            }
        }
    }
    await verifyAndDebug()
}

