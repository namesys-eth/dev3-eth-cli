import { ethers } from 'ethers'
import axios from 'axios'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

async function githubIDExists(username) {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`)
        return response.status === 200
    } catch (error) {
        return false
    }
}

function isValidGithubID(githubID) {
    // GithubID validation logic
    const githubIDRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
    return githubIDRegex.test(githubID)
}

function getGithubID() {
    return new Promise((resolve) => {
        rl.question('Enter your GitHub ID: ', async (githubID) => {
            if (isValidGithubID(githubID)) {
                const _githubIDExists = await githubIDExists(githubID)
                if (_githubIDExists) {
                    console.log(`👋 Welcome, ${githubID}!`)
                    resolve(true) // Resolve the promise with true
                } else {
                    console.log('❌ GitHub ID Not Found. Please try again OR press CTRL + C to exit')
                    resolve(await getGithubID()) // Recursive call to prompt for githubID again
                }
            } else {
                console.log('❌ Invalid GitHub ID. Please try again OR press CTRL + C to exit')
                resolve(await getGithubID()) // Recursive call to prompt for githubID again
            }
        })
    })
}

async function getPassword() {
    const welcome = await getGithubID()
    if (welcome) {
        return new Promise((resolve) => {
            rl.question('Choose Password (optional): ', async (password) => {
                resolve(password) // Resolve the promise with true
                rl.close()
            })
        })
    }
}

getPassword()