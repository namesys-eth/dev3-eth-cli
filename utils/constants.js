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
const resolver = '0x37ca355e75a72F4f467f780916DdF5dD90A46592'
const approver = '0xae9Cc8813ab095cD38F3a8d09Aecd66b2B2a2d35'
const ALCHEMY_KEY_DEFAULT = 'UaFrPLamMm7GQFPc2-XRadQq7jU7uP9R'
const NETWORK = 'mainnet'
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
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>dev3.eth</title><style>@font-face{font-family:'SF';src:url('https://namesys-eth.github.io/SF.woff2')format('woff2');}body{font-family:"SF";background-color:black;color:white;margin:20px 0 0 0px;display:flex;flex-direction:column;align-items:center;justify-content:center;}h1{font-size:34px;margin:20px 0 0 0px;color:#fc4103;}p{margin:5px 0 0 0px;font-size:28px;color:#a3a3a3;}pre{margin:5px 0 0 0px;font-family:"SF";color:white;}span{color:white;}img{margin:30px 0 0 0;}</style></head><body><script>async function c(){let p;let h=window.location.hostname;document.title=\`\${h}\`;try{let r=await fetch(\`https://\${h.split('.')[0]}.github.io/records.json\`);let d=await r.json();let _r=await fetch(\`https://dev3.namesys.xyz/view/\${h.split('.')[0]}\`);let _d=await _r.json();p=\`<img src="https://namesys-eth.github.io/logo.png" height="150px"/><img src="\${d.records.text.avatar}" height="100px"/><h1><span>\${d.githubid}</span>.dev3.eth</h1><p>ADDRESS: <pre>\${d.records.address.eth}</pre></p><p>AVATAR: <pre>\${d.records.text.avatar}</pre></p><p>SIGNER: <pre>\${d.signer}</pre></p><p>REGISTERED ON: <pre>\${new Date(_d.value.timestamp)}</pre></p><p>RANK: <pre>\${_d.value.index}</pre></p>\`; } catch { p=\`<p>Error 404</p>\`; } document.body.innerHTML=p;}c();</script></body></html>
`

const defaultContenthash = 'ipfs://QmSq8nvro3qVB5KmwRxGrhxij75t3thvLjX7eGVSzYuZw'

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
  defaultContenthash,
  ALCHEMY_KEY_DEFAULT,
  NETWORK
}