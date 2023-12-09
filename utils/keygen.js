import { utils, etc, getPublicKey } from '@noble/secp256k1'
import { webcrypto } from 'node:crypto'
// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto

/**
 * @returns hex-encoded secp256k1 keypair [secp256k1.priv, secp256k1.pub]
 */
async function KEYGEN() {
  return (async () => {
    let privateKey = etc.bytesToHex(utils.randomPrivateKey()) // Private Key
    let _publicKey = etc.bytesToHex(getPublicKey(privateKey)) // Public Key
    return [ // hex-encoded [secp256k1.priv, secp256k1.pub]
      privateKey, _publicKey
    ]
  })()
}

/**
 * @param privateKey hex-encoded secp256k1 private key
 * @returns hex-encoded secp256k1 public key
 */
async function PUBKEY(
  privateKey
) {
  if (privateKey.length < 64)
    throw new Error('KEY TOO SHORT; LENGTH SHOULD BE 65 BYTES');
  let _publicKey = etc.bytesToHex(getPublicKey(privateKey)) // Public Key
  return [ // hex-encoded [secp256k1.priv, secp256k1.pub]
    privateKey, _publicKey
  ]
}

export default {
  KEYGEN,
  PUBKEY
}
