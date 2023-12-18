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
const ipfsRegexCIDv0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
const ipfsRegexCIDv1 = /^b[0-9a-z]+[1-9A-HJ-NP-Za-km-z]+$/
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
const validator = 'https://dev3.namesys.xyz/verify/'
const signedRecord = 'function signedRecord(address recordSigner, bytes memory recordSignature, bytes memory approvedSignature, bytes memory result)'
const resolver = '0x58BBB1e1d2552d81615C67Afc41aFE07D00204De'
const approver = '0xae9Cc8813ab095cD38F3a8d09Aecd66b2B2a2d35'
const ALCHEMY_KEY_DEFAULT = 'UaFrPLamMm7GQFPc2-XRadQq7jU7uP9R'
const NETWORK = 'goerli'
const record = 'records.json'
const verify = 'verify.json'
const history = 'https://dev3.namesys.xyz/count'
const records = {
  addr60: 'records/address/60.json',
  avatar: 'records/text/avatar.json',
  contenthash: 'records/contenthash.json'
}
const recordContent = {
  data: null,
  value: null,
  signer: null,
  signature: null,
  approved: false,
  approval: null
}
const recordsContent = {
  githubid: null,
  signer: null,
  approval: null,
  records: {
    contenthash: null,
    address: {
      eth: null
    },
    text: {
      avatar: null
    }
  }
}
const verifyContent = {
  signer: null,
  verified: false,
  accessKey: null
}
// Create a minimal HTML file content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
</head>
<body>
  <h1></h1>
</body>
</html>
`

export default {
  githubIDRegex,
  keyRegex,
  addressRegex,
  urlRegex,
  ipnsRegex,
  ipfsRegexCIDv0,
  ipfsRegexCIDv1,
  onionRegex,
  records,
  record,
  validator,
  verify,
  zeroAddress,
  signedRecord,
  resolver,
  htmlContent,
  verifyContent,
  recordContent,
  recordsContent,
  approver,
  history,
  ALCHEMY_KEY_DEFAULT,
  NETWORK
}