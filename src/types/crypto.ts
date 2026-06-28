export interface EcdhKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface CryptoSession {
  sessionId: string;
  keyEpoch: number;
  sendKey: CryptoKey;
  receiveKey: CryptoKey;
  sharedSecret: CryptoKey;
  transcriptHash: Uint8Array;
}

export interface DeriveSessionInput {
  sessionId: string;
  localPrivateKey: CryptoKey;
  remotePublicKey: CryptoKey;
  hostNonce: Uint8Array;
  joinerNonce: Uint8Array;
}
