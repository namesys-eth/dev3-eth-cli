import fs, { writeFileSync, readFileSync, existsSync } from 'fs'
import axios from 'axios'
import constants from './constants.js'
import graphics from './graphics.js'
import { execSync } from 'child_process'
import { ethers, SigningKey, Wallet } from 'ethers'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

const SIGNER = process.env.SIGNER

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
    fs.statSync('.git')
    return true
  } catch (error) {
    return false
  }
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
    if (usernameMatch) {
      return [
        usernameMatch[1], 
        branch, 
        signingKey
      ]
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// Attempts Git Commit & Push of Config
async function gitCommitPushConfig(branch, timestamp, githubKey) {
  try {
    if (githubKey) {
      execSync(`git add verify.json .gitignore .nojekyll; git commit -S -m "dev3 init: ${timestamp}"; git push -u origin ${branch}`)
    } else {
      execSync(`git add verify.json .gitignore .nojekyll; git commit -m "dev3 init: ${timestamp}"; git push -u origin ${branch}`)
    }
    return true
  } catch (error) {
    graphics.print('❌ Failed to Commit & Push to Git. Quitting...', "orange")
    return null
  }
}

// Attempts Git Commit & Push of Signed Records
async function gitCommitPushRecords(branch, timestamp, githubKey) {
  try {
    if (githubKey) {
      execSync(`git add verify.json .well-known; git commit -S -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`)
    } else {
      execSync(`git add verify.json .well-known; git commit -m "dev3 publish: ${timestamp}"; git push -u origin ${branch}`)
    }
    return true
  } catch (error) {
    graphics.print('❌ Failed to Commit & Push to Git. Quitting...', "orange")
    return null
  }
}

//Checks if remote tip is ahead of local
async function isRemoteAhead(branch) {
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
async function isGHPConfigured(username) {
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

export default {
  githubIDExists,
  isValidGithubID,
  isValidSigner,
  isGitRepo,
  getGitRepo,
  writeConfig,
  gitCommitPushConfig,
  isGHPConfigured,
  gitCommitPushRecords,
  isRemoteAhead,
  signRecord
}