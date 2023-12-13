import { writeFileSync, readFileSync, existsSync, statSync, readdirSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import constants from './constants.js'
import graphics from './graphics.js'
import * as ensContent from './contenthash.js'
import { execSync } from 'child_process'
import { ethers, SigningKey, Wallet } from 'ethers'
import { createRequire } from 'module'
import { formatsByName } from '@ensdomains/address-encoder'
const require = createRequire(import.meta.url)
require('dotenv').config()

const SIGNER = process.env.SIGNER

// Creates a deep file
async function createDeepFile(filePath) {
  try {
    const directory = path.dirname(filePath)
    await fs.mkdir(directory, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(constants.record, null, 2))
    graphics.print(`🧪 Made record file: ${filePath}`, "skyblue")
    return true
  } catch (error) {
    console.log(error)
    graphics.print(`❌ Error creating file: ${filePath}`, "orange")
    return false
  }
}

// Checks if GitHub user exists with given GitHub ID
async function githubIDExists(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`)
    return response.status === 200
  } catch (error) {
    return false
  }
}

// Checks if GitHub ID is in valid format
function isValidGithubID(githubID) {
  // GithubID validation logic
  const githubIDRegex = constants.githubIDRegex
  return githubIDRegex.test(githubID)
}

// Checks if Signing Key is in valid format
function isValidSigner(signingKey) {
  // GithubID validation logic
  const keyRegex = constants.keyRegex
  return keyRegex.test(signingKey)
}

// Checks if current directory is Git repository
function isGitRepo() {
  try {
    statSync('.git')
    return true
  } catch (error) {
    return false
  }
}

// Check for valid ethereum address
function isAddr(value) {
  return constants.addressRegex.test(value.slice(2))
}
// Check for valid URL
function isURL(value) {
  return constants.urlRegex.test(value)
}
// Check for valid ENS Contenthash
function isContenthash(value) {
  return (
    constants.ipnsRegex.test(value.slice(7)) || // strip 'ipns://'
    constants.ipfsRegexCID0.test(value.slice(7)) || // strip 'ipfs://'
    constants.ipfsRegexCID0.test(value.slice(7)) || // strip 'ipfs://'
    constants.onionRegex.test(value.slice(8)) // strip 'onion://'
  )
}

// Gets username from Git repository
async function getGitRepo() {
  try {
    // Run git command to get remote URL
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    const signingKey = execSync('git config --get user.signingkey').toString().trim()
    // Extract username from GitHub remote URL
    const usernameMatch = remoteUrl.match(/github\.com[:/](\w+[-_]?\w+)/)
    const repoName = remoteUrl.split('/').pop().replace(/\.git$/, '')
    if (usernameMatch) {
      return [
        usernameMatch[1],
        branch,
        signingKey,
        repoName
      ]
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// Checks if the user is in a Git repo
function validateGitRepo(rl) {
  return new Promise(async (resolve) => {
    const _isGitRepo = isGitRepo()
    if (_isGitRepo) {
      const [_username, _branch, _githubKey, _repoName] = await getGitRepo()
      if (_repoName.toLowerCase() === `${_username}.github.io`) {
        graphics.print(`✅ Valid git repository: ${_repoName.toLowerCase()}`, "lightgreen")
        graphics.print(`👉 Please ensure that Github Pages (https://${_username}.github.io/) is configured to auto-deploy upon push from default repository \'${_repoName.toLowerCase()}\'`, "yellow")
      } else {
        graphics.print(`🚧 Detected custom git repository: ${_repoName.toLowerCase()} (default: ${_username}.github.io)`, "yellow")
        graphics.print(`👉 Please ensure that Github Pages (https://${_username}.github.io/) is configured to auto-deploy upon push from custom repository \'${_repoName.toLowerCase()}\'. Otherwise, please deploy it manually from \'${_repoName.toLowerCase()}\' OR switch to default repository \'${_username}.github.io\'`, "yellow")
        graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "yellow")
      }
      const _synced = !await isRemoteSynced(_branch)
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
        graphics.print(`❗ Cannot proceed further! Remote branch is out of sync with local. please \'git push\' or \'git pull\' to sync with remote tip and then try again`, "orange")
        graphics.print(`❌ Please \'git merge\' or \'git pull\' to sync with remote tip and then try again. Quitting...`, "orange")
        rl.close()
        resolve([
          _isGitRepo,
          null,
          null,
          null,
          null
        ])
      }
    } else {
      graphics.print(`❌ Not a git repository! Please initialise and configure as git repository first. Quitting...`, "orange")
      graphics.print(`❗ PRE-REQUISITES:`, "orange")
      graphics.print(`👉 Please make sure that git repository is initialised and configured to push to remote branch on Github`, "orange")
      graphics.print(` ◥ docs: https://docs.github.com/en/get-started/using-git/about-git#github-and-the-command-line`, "orange")
      graphics.print(`👉 Please make sure that Github Pages (https://<githubID>.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
      graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "orange")
      rl.close()
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
function requestGithubID(detectedUser, rl) {
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
function validateGithubID(rl) {
  return new Promise((resolve) => {
    rl.question('⏰ Please enter your Github ID: ', async (githubID) => {
      if (isValidGithubID(githubID)) {
        const _githubIDExists = await githubIDExists(githubID)
        if (_githubIDExists) {
          graphics.print(`👋 Welcome, ${githubID}!`, "yellow")
          const _ghpages = await isGithubPagesConfigured(githubID)
          if (_ghpages) {
            graphics.print(`✅ Github Page exists: https://${githubID}.github.io/`, "lightgreen")
            graphics.print(`👉 Please ensure that Github Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "skyblue")
            graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
            resolve(true) // Resolve the promise with true
          } else {
            graphics.print(`❌ Github Page DOES NOT exist: https://${githubID}.github.io/`, "orange")
            graphics.print(`👉 Please ensure that Github Page (https://${githubID}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
            graphics.print(`💡 TIP: If the issue persists, try committing a minimal \'README.md\' (or \'index.html\') file to your remote repository`, "yellow")
            graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "orange")
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
    const _ghpages = await isGithubPagesConfigured(detectedUser)
    if (_ghpages) {
      graphics.print(`✅ Github Page exists: https://${detectedUser}.github.io/`, "lightgreen")
      graphics.print(`👉 Please ensure that Github Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "skyblue")
      graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "skyblue")
      resolve(true)
    } else {
      graphics.print(`❌ Github Page DOES NOT exist: https://${detectedUser}.github.io/`, "orange")
      graphics.print(`👉 Please ensure that Github Page (https://${detectedUser}.github.io/) is configured to auto-deploy upon push from the remote branch`, "orange")
      graphics.print(`💡 TIP: If the issue persists, try committing a minimal \'README.md\' (or \'index.html\') file to your remote repository`, "yellow")
      graphics.print(` ◥ docs: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`, "orange")
      graphics.print(`❌ Quitting...`, "orange")
      resolve(false)
    }
  })
}

// Sends Git Commit & Push to Remote
async function sendToRemote(branch, timestamp, githubKey, files) {
  try {
    if (githubKey) {
      execSync(`git add ${files}; git commit -S -m "dev3: ${timestamp}"; git push -u origin ${branch}`)
    } else {
      execSync(`git add ${files}; git commit -m "dev3: ${timestamp}"; git push -u origin ${branch}`)
    }
    return true
  } catch (error) {
    graphics.print('❌ Failed to Commit & Push to Git. Quitting...', "orange")
    return null
  }
}

// Try Git Commit & Push
async function gitCommitPush(validated, branch, githubKey, detectedUser, rl, files, message) {
  if (validated) {
    return new Promise(async (resolve) => {
      const timestamp = Date.now()
      graphics.print(`🧪 Detected branch: ${branch}`, "skyblue")
      if (githubKey) {
        graphics.print(`🧪 Detected signature fingerprint: ${githubKey}`, "skyblue")
        graphics.print(`🧪 Trying auto-update: git add ${files}; git commit -S -m "dev3: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
      } else {
        graphics.print(`🧪 Trying auto-update: git add ${files}; git commit -m "dev3: ${timestamp}"; git push -u origin ${branch}`, "skyblue")
      }
      rl.question(`⏰ Try git commit & push? [Y/N]: `, async (attempt) => {
        if (attempt.toLowerCase() === 'y' || attempt.toLowerCase() === 'yes') {
          const _pushed = await sendToRemote(branch, timestamp, githubKey, files)
          resolve(_pushed)
          graphics.print(message, "lightgreen")
          graphics.print(`👋 BYEE!`, "lightgreen")
          rl.close()
        } else if (attempt.toLowerCase() === 'n' || attempt.toLowerCase() === 'no') {
          graphics.print(`👋 OK, BYEE!`, "lightgreen")
          rl.close()
          resolve(false)
        } else {
          graphics.print('⛔ Bad Input', "orange")
          resolve(await gitCommitPush(validated, branch, githubKey, detectedUser, rl, files, message)) // Recursive call
        }
      })
    })
  } else {
    return new Promise(async (resolve) => {
      resolve(false)
    })
  }
}

//Checks if remote tip is ahead of local
async function isRemoteSynced(branch) {
  try {
    // Get the commit hash of the local branch
    const localCommit = execSync(`git rev-parse ${branch}`).toString().trim()
    // Get the commit hash of the remote branch
    const remoteCommit = execSync(`git ls-remote origin ${branch}`).toString().split('\t')[0].trim()
    // Check if the remote commit is ahead of the local commit
    return localCommit !== remoteCommit
  } catch (error) {
    // Handle errors, e.g., when git commands fail
    graphics.print('❗ Failed to Fetch Remote Branch...', "orange")
    return false
  }
}

// Checks if GitHub Pages is configured
async function isGithubPagesConfigured(username) {
  try {
    const response = await axios.get(`https://${username}.github.io/`)
    return response.status === 200 && response.status !== 404
  } catch (error) {
    return false
  }
}

// Writes to .env & verify.json, and .gitignore
async function writeConfig(signerKey) {
  const envContent = `SIGNER=${signerKey[0]}`
  const verifyContent = {
    signer: ethers.computeAddress(`0x${signerKey[0]}`),
    verified: false,
    accessKey: null
  }
  const gitignoreContent = 'node_modules\n.env\npackage-lock.json'
  // Write content to .env file
  writeFileSync('.env', envContent)
  // Check if .gitignore file exists
  if (!existsSync('.gitignore')) {
    // If not, create .gitignore file and add specified content
    writeFileSync('.gitignore', gitignoreContent)
    return true
  } else {
    // If .gitignore exists, check if it contains '.env' line
    const gitignoreContents = readFileSync('.gitignore', 'utf-8')
    if (!gitignoreContents.includes('.env')) {
      // If '.env' line is not present, add it to .gitignore
      writeFileSync('.gitignore', `${gitignoreContents}\n${envContent}`)
    }
    writeFileSync('verify.json', JSON.stringify(verifyContent, null, 2))
    if (!existsSync('README.md')) writeFileSync('README.md', '#')
    return true
  }
}

// Signs an ENS Record
async function signRecord(gateway, chainID, resolver, recordType, extradata, signer) {
  let _toSign = `Requesting Signature To Update ENS Record\n\nGateway: ${gateway}\nResolver: eip155:${chainID}:${resolver}\nRecord Type: ${recordType}\nExtradata: ${extradata}\nSigned By: ${signer}`
  let _key = new SigningKey(SIGNER.slice(0, 2) === "0x" ? SIGNER : "0x" + SIGNER)
  let _signer = new Wallet(_key)
  let signature = await _signer.signMessage(_toSign)
  return [_toSign, signature]
}

/// Encodes string values of records
// returns abi.encodeWithSelector(iCallbackType.signedRecord.selector, _signer, _recordSignature, _approvedSignature, result)
function encodeValue(key, value, _signer, _recordSignature, _approvedSignature) {
  let encoded
  let _value = ''
  let type = ''
  if (['avatar', 'email', 'pubkey', 'github', 'url', 'twitter', 'x', 'discord', 'farcaster', 'nostr', 'zonehash'].includes(key)) {
    type = 'string'
    _value = value
  }
  if (['btc', 'ltc', 'doge', 'sol', 'atom'].includes(key)) {
    type = 'bytes'
    _value = `0x${formatsByName[key.toUpperCase()].decoder(value).toString('hex')}`
  }
  if (key === 'contenthash') {
    type = 'bytes'
    _value = ensContent.encodeContenthash(value).encoded
  }
  if (key === 'addr') {
    type = 'address'
    _value = value
  }
  let _result = ethers.AbiCoder.defaultAbiCoder().encode([type], [_value])
  let _ABI = [constants.signedRecord]
  let _interface = new ethers.Interface(_ABI)
  let _encodedWithSelector = _interface.encodeFunctionData(
    "signedRecord",
    [
      _signer,
      _recordSignature,
      _approvedSignature,
      _result
    ]
  )
  encoded = _encodedWithSelector
  return encoded
}

// Generates extradata
function genExtradata(key, _recordValue) {
  // returns bytesToHexString(abi.encodePacked(keccak256(result)))
  let type = ''
  let _value = ''
  if (['avatar', 'email', 'pubkey',
    'github', 'url', 'twitter', 'x', 'discord', 'farcaster', 'nostr',
    'zonehash'
  ].includes(key)) {
    type = 'string'
    _value = _recordValue
  }
  if ([
    'btc', 'ltc', 'doge', 'sol', 'atom'
  ].includes(key)) {
    type = 'bytes'
    _value = `0x${formatsByName[key.toUpperCase()].decoder(_recordValue).toString('hex')}`
  }
  if (key === 'contenthash') {
    type = 'bytes'
    _value = ensContent.encodeContenthash(_recordValue).encoded
  }
  if (key === 'addr') {
    type = 'address'
    _value = _recordValue
  }
  let _result = ethers.AbiCoder.defaultAbiCoder().encode([type], [_value])
  const toPack = ethers.keccak256(_result)
  const _extradata = ethers.hexlify(ethers.solidityPacked(["bytes"], [toPack]))
  return _extradata
}

export default {
  createDeepFile,
  githubIDExists,
  isValidGithubID,
  isValidSigner,
  isGitRepo,
  getGitRepo,
  writeConfig,
  isGithubPagesConfigured,
  isRemoteSynced,
  signRecord,
  requestGithubID,
  validateGitRepo,
  validateGithubID,
  skipGithubID,
  gitCommitPush,
  isAddr,
  isURL,
  isContenthash,
  encodeValue,
  genExtradata
}