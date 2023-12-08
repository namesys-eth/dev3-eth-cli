import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { etc, getPublicKey } from '@noble/secp256k1';

/**
 * @param  username Key identifier
 * @param    caip10 CAIP identifier for the blockchain account
 * @param signature 65-byte deterministic hex string
 * @param  password Optional password
 * @returns Deterministic private/public keypairs as hex strings
 * Hex-encoded
 * [secp256k1.priv, secp256k1.pub]
 */
async function KEYGEN(
  username,
  caip10,
  signature,
  password
) {
  if (signature.length < 64)
    throw new Error('SIGNATURE TOO SHORT; LENGTH SHOULD BE 65 BYTES');
  let inputKey = sha256(
    etc.hexToBytes(
      signature.toLowerCase().startsWith('0x') ? signature.slice(2) : signature
    )
  );
  let info = `${caip10}:${username}`;
  let salt = sha256(`${info}:${password ? password : ''}:${signature.slice(-64)}`);
  let hashKey = hkdf(sha256, inputKey, salt, info, 42);
  let privateKey = etc.bytesToHex(etc.hashToPrivateKey(hashKey)); // Private Key
  let publicKey = etc.bytesToHex(getPublicKey(privateKey)); // Public Key
  return [ // Hex-encoded [secp256k1.priv, secp256k1.pub]
    privateKey, publicKey
  ];
}

export default {
  KEYGEN
};