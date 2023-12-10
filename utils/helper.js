import fs, { writeFileSync, readFileSync, existsSync } from 'fs'
import axios from 'axios'
import constants from './constants.js'
import graphics from './graphics.js'
import { execSync } from 'child_process'
import { ethers } from 'ethers'

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

// Attempts Git Commit & Push
async function gitCommitPush(branch, timestamp) {
  try {
    execSync(`git add verify.json .gitignore; git commit -m "dev3.eth: ${timestamp}"; git push origin ${branch}`)
    return true
  } catch (error) {
    graphics.print('❌ Failed to Commit & Push to Git. Quitting...', "red")
    return null
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
    signer: ethers.computeAddress(`0x${signerKey[0]}`).slice(2),
    pubkey: signerKey[1],
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

export default {
  githubIDExists,
  isValidGithubID,
  isValidSigner,
  isGitRepo,
  getGitRepo,
  writeConfig,
  gitCommitPush,
  isGHPConfigured
}