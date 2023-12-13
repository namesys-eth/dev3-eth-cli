const githubIDRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
const keyRegex = /^[0-9a-fA-F]{64}$/
const addressRegex = /^[0-9a-fA-F]{40}$/
const zeroAddress = '0x' + '0'.repeat(40)
const zeroBytes = '0x' + '0'.repeat(64)
const zeroKey = '0x' + '0'.repeat(64)
const buffer = "\x19Ethereum Signed Message:\n"
const ipnsPrefix = '0xe5010172002408011220'
const httpPrefix = '0x6874'
const ipnsRegex = /^[a-z0-9]{62}$/
const ipfsRegexCID0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
const ipfsRegexCID1 = /^bafy[a-zA-Z0-9]{55}$/
const onionRegex = /^[a-z2-7]{16,56}$/
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
const hexRegex = /^[0-9a-fA-F]+$/
const twitterRegex = /^[A-Za-z][A-Za-z0-9_]{0,14}$/
const zonehashRegex = /^0x[a-fA-F0-9]+$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const discordRegex = /^.{3,32}#[0-9]{4}$/
const farcasterRegex = /^[a-z0-9][a-z0-9-]{0,15}$/
const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34})|(3[a-km-zA-HJ-NP-Z1-9]{25,34})|(bc1[a-zA-HJ-NP-Z0-9]{6,87})$/
const ltcRegex = /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/
const dogeRegex = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{24,33}$/
const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const atomRegex = /^cosmos1[a-zA-Z0-9]{38}$/
const records = {
  all: 'records.json',
  addr60: 'records/addr/60.json',
  avatar: 'records/text/avatar.json',
  contenthash: 'records/contenthash.json'
}

const record = {
  data: null,
  value: null,
  signer: null,
  signature: null,
  approved: false,
  approval: null
}

const validator = 'https://dev3.namesys.xyz/verify/'
const verify = 'verify.json'
const signedRecord = 'function signedRecord(address recordSigner, bytes memory recordSignature, bytes memory approvedSignature, bytes memory result)'

export default {
  githubIDRegex,
  keyRegex,
  addressRegex,
  urlRegex,
  ipnsRegex,
  ipfsRegexCID0,
  ipfsRegexCID1,
  onionRegex,
  records,
  record,
  validator,
  verify,
  zeroAddress,
  signedRecord
}