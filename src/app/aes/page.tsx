
'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check, AlertTriangle} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

// AES Constants
const S_BOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);

const INV_S_BOX = new Uint8Array([
  0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
  0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
  0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
  0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
  0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
  0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
  0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
  0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
  0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
  0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
  0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
  0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
  0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
  0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
  0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
  0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d,
]);

const RCON = new Uint8Array([
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, // RCON for up to 14 rounds (AES-256)
  0x6c, 0xd8, 0xab, 0x4d // Extend RCON if ever needed for >14 rounds, not used by AES-128/192/256
]);

const BLOCK_SIZE = 16; // AES block size in bytes (Nb = 4 words)
const Nb = 4; // Number of columns (32-bit words) comprising the State. For AES, this is always 4.


// Helper Functions
const hexToBytes = (hex: string): Uint8Array | null => {
  if (hex.length % 2 !== 0) return null;
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      if (isNaN(bytes[i / 2])) return null;
    }
    return bytes;
  } catch (e) {
    return null;
  }
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

const stringToBytes = (str: string): Uint8Array => new TextEncoder().encode(str);
const bytesToString = (bytes: Uint8Array): string => {
   try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (e) {
    throw new Error("Decrypted data is not valid UTF-8. Original might have been binary or used different encoding.");
  }
}

function pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
  const paddingLength = blockSize - (data.length % blockSize);
  const padding = new Uint8Array(paddingLength).fill(paddingLength);
  const paddedData = new Uint8Array(data.length + paddingLength);
  paddedData.set(data);
  paddedData.set(padding, data.length);
  return paddedData;
}

function pkcs7Unpad(data: Uint8Array): Uint8Array | null {
  if (data.length === 0) return null;
  const paddingLength = data[data.length - 1];
  if (paddingLength === 0 || paddingLength > data.length || paddingLength > BLOCK_SIZE) return null;
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) return null;
  }
  return data.slice(0, data.length - paddingLength);
}

function xorUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) throw new Error("Uint8Arrays must have the same length to XOR.");
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

// AES Core Logic
function subBytes(state: Uint8Array, isInv: boolean): void {
  const box = isInv ? INV_S_BOX : S_BOX;
  for (let i = 0; i < BLOCK_SIZE; i++) {
    state[i] = box[state[i]];
  }
}

function shiftRows(state: Uint8Array, isInv: boolean): void {
  const temp = new Uint8Array(4);
  for (let r = 1; r < 4; r++) {
    for (let c = 0; c < Nb; c++) temp[c] = state[r + c * Nb]; // Access state by column-major order: state[row + col*Nb]
    
    let shift = r;
    if (isInv) shift = Nb - r; // Nb is 4 for AES

    for (let c = 0; c < Nb; c++) {
      state[r + c * Nb] = temp[(c + shift) % Nb];
    }
  }
}

function xtime(x: number): number {
  return ((x << 1) ^ ((x & 0x80) ? 0x1b : 0x00)) & 0xff;
}

const gmul = (a: number, b: number): number => {
    let p = 0;
    for (let counter = 0; counter < 8; counter++) {
        if ((b & 1) !== 0) {
            p ^= a;
        }
        const hi_bit_set = (a & 0x80) !== 0;
        a <<= 1;
        if (hi_bit_set) {
            a ^= 0x1b; /* x^8 + x^4 + x^3 + x + 1 */
        }
        b >>= 1;
    }
    return p;
};

function mixColumns(state: Uint8Array, isInv: boolean): void {
  for (let c = 0; c < Nb; c++) { // Nb is 4 for AES
    const colOffset = c * Nb;
    const s0 = state[colOffset + 0];
    const s1 = state[colOffset + 1];
    const s2 = state[colOffset + 2];
    const s3 = state[colOffset + 3];

    if (isInv) {
      state[colOffset + 0] = gmul(s0, 0x0e) ^ gmul(s1, 0x0b) ^ gmul(s2, 0x0d) ^ gmul(s3, 0x09);
      state[colOffset + 1] = gmul(s0, 0x09) ^ gmul(s1, 0x0e) ^ gmul(s2, 0x0b) ^ gmul(s3, 0x0d);
      state[colOffset + 2] = gmul(s0, 0x0d) ^ gmul(s1, 0x09) ^ gmul(s2, 0x0e) ^ gmul(s3, 0x0b);
      state[colOffset + 3] = gmul(s0, 0x0b) ^ gmul(s1, 0x0d) ^ gmul(s2, 0x09) ^ gmul(s3, 0x0e);
    } else {
      state[colOffset + 0] = gmul(s0, 2) ^ gmul(s1, 3) ^ s2 ^ s3;
      state[colOffset + 1] = s0 ^ gmul(s1, 2) ^ gmul(s2, 3) ^ s3;
      state[colOffset + 2] = s0 ^ s1 ^ gmul(s2, 2) ^ gmul(s3, 3);
      state[colOffset + 3] = gmul(s0, 3) ^ s1 ^ s2 ^ gmul(s3, 2);
    }
  }
}

function addRoundKey(state: Uint8Array, roundKey: Uint8Array): void {
  for (let i = 0; i < BLOCK_SIZE; i++) {
    state[i] ^= roundKey[i];
  }
}

function keyExpansion(cipherKey: Uint8Array, Nk: number, Nr: number): Uint8Array[] {
  const w = new Uint8Array(Nb * (Nr + 1) * 4); // Expanded key schedule (words as bytes)
  
  // Copy cipherKey to the first Nk words of the expanded key
  for (let i = 0; i < Nk * 4; i++) {
    w[i] = cipherKey[i];
  }

  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = w.slice((i - 1) * 4, i * 4); // Previous word

    if (i % Nk === 0) {
      // RotWord: Rotate left by one byte
      const t = temp[0]; temp[0] = temp[1]; temp[1] = temp[2]; temp[2] = temp[3]; temp[3] = t;
      // SubWord: Apply S-Box to each byte
      for (let j = 0; j < 4; j++) temp[j] = S_BOX[temp[j]];
      // XOR with Rcon
      temp[0] ^= RCON[i / Nk];
    } else if (Nk > 6 && i % Nk === 4) { // Only for AES-256 (Nk=8)
      // SubWord: Apply S-Box to each byte
      for (let j = 0; j < 4; j++) temp[j] = S_BOX[temp[j]];
    }
    
    // XOR temp with word Nk positions earlier
    const wOffset = i * 4;
    const prevWOffset = (i - Nk) * 4;
    for (let j = 0; j < 4; j++) {
      w[wOffset + j] = w[prevWOffset + j] ^ temp[j];
    }
  }
  
  const roundKeys: Uint8Array[] = [];
  for (let round = 0; round <= Nr; round++) {
    roundKeys.push(w.slice(round * BLOCK_SIZE, (round + 1) * BLOCK_SIZE));
  }
  return roundKeys;
}

function aesEncryptBlock(block: Uint8Array, roundKeys: Uint8Array[], Nr: number): Uint8Array {
  const state = new Uint8Array(block);
  addRoundKey(state, roundKeys[0]);

  for (let round = 1; round < Nr; round++) {
    subBytes(state, false);
    shiftRows(state, false);
    mixColumns(state, false);
    addRoundKey(state, roundKeys[round]);
  }

  subBytes(state, false);
  shiftRows(state, false);
  addRoundKey(state, roundKeys[Nr]);
  
  return state;
}

function aesDecryptBlock(block: Uint8Array, roundKeys: Uint8Array[], Nr: number): Uint8Array {
  const state = new Uint8Array(block);
  addRoundKey(state, roundKeys[Nr]);

  for (let round = Nr - 1; round >= 1; round--) {
    shiftRows(state, true);
    subBytes(state, true);
    addRoundKey(state, roundKeys[round]);
    mixColumns(state, true);
  }

  shiftRows(state, true);
  subBytes(state, true);
  addRoundKey(state, roundKeys[0]);
  
  return state;
}


export default function AesCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('000102030405060708090a0b0c0d0e0f'); // Default AES-128 key
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const process = (isEncrypt: boolean) => {
    setError('');
    setResult('');

    if (key.length !== 32 && key.length !== 48 && key.length !== 64) {
      setError('AES key must be 32 (AES-128), 48 (AES-192), or 64 (AES-256) hexadecimal characters.');
      return;
    }
    const keyBytes = hexToBytes(key);
    if (!keyBytes) {
      setError('Invalid hexadecimal key. Please use characters 0-9 and a-f.');
      return;
    }
    
    if (!text) {
        setError(isEncrypt ? 'Plaintext cannot be empty.' : 'Ciphertext (hex) cannot be empty.');
        return;
    }

    let Nk: number, Nr: number;
    if (keyBytes.length === 16) { // AES-128
      Nk = 4; Nr = 10;
    } else if (keyBytes.length === 24) { // AES-192
      Nk = 6; Nr = 12;
    } else if (keyBytes.length === 32) { // AES-256
      Nk = 8; Nr = 14;
    } else {
      setError('Internal error: Invalid key byte length processed.'); // Should be caught by hex length check
      return;
    }

    try {
      const roundKeys = keyExpansion(keyBytes, Nk, Nr);
      let outputBytesTotal = new Uint8Array(0);

      if (isEncrypt) {
        const plaintextBytes = stringToBytes(text);
        const paddedPlaintext = pkcs7Pad(plaintextBytes, BLOCK_SIZE);
        
        const iv = new Uint8Array(BLOCK_SIZE);
        crypto.getRandomValues(iv);

        let previousCipherBlock = iv;
        const encryptedBlocksArray: Uint8Array[] = [];

        for (let i = 0; i < paddedPlaintext.length; i += BLOCK_SIZE) {
          const currentPlaintextBlock = paddedPlaintext.slice(i, i + BLOCK_SIZE);
          const blockToEncrypt = xorUint8Arrays(currentPlaintextBlock, previousCipherBlock);
          const encryptedBlock = aesEncryptBlock(blockToEncrypt, roundKeys, Nr);
          encryptedBlocksArray.push(encryptedBlock);
          previousCipherBlock = encryptedBlock;
        }
        
        outputBytesTotal = Uint8Array.from([...iv, ...encryptedBlocksArray.reduce((acc, val) => Uint8Array.from([...acc, ...val]), new Uint8Array(0))]);
        setResult(bytesToHex(outputBytesTotal));

      } else { // Decrypt
        const inputHexBytes = hexToBytes(text);
        if (!inputHexBytes) {
           setError('Invalid hexadecimal ciphertext.');
           return;
        }
        if (inputHexBytes.length < BLOCK_SIZE * 2) { // Must contain IV + at least one block
            setError('Ciphertext (hex) is too short. It must include a 16-byte IV and at least one 16-byte block.');
            return;
        }
        if ((inputHexBytes.length - BLOCK_SIZE) % BLOCK_SIZE !== 0) {
          setError('Ciphertext (excluding IV) length must be a multiple of 16 bytes (32 hex characters).');
          return;
        }

        const iv = inputHexBytes.slice(0, BLOCK_SIZE);
        const ciphertextBytes = inputHexBytes.slice(BLOCK_SIZE);
        
        let previousCipherBlock = iv;
        const decryptedBlocksArray: Uint8Array[] = [];

        for (let i = 0; i < ciphertextBytes.length; i += BLOCK_SIZE) {
          const currentCipherBlock = ciphertextBytes.slice(i, i + BLOCK_SIZE);
          const decryptedIntermediate = aesDecryptBlock(currentCipherBlock, roundKeys, Nr);
          const plaintextBlockPadded = xorUint8Arrays(decryptedIntermediate, previousCipherBlock);
          decryptedBlocksArray.push(plaintextBlockPadded);
          previousCipherBlock = currentCipherBlock;
        }
        
        const paddedOutput = decryptedBlocksArray.reduce((acc, val) => Uint8Array.from([...acc, ...val]), new Uint8Array(0));
        const unpaddedOutput = pkcs7Unpad(paddedOutput);

        if (!unpaddedOutput) {
            setError("Decryption failed: Invalid PKCS#7 padding.");
            return;
        }
        setResult(bytesToString(unpaddedOutput));
      }
    } catch (e) {
      setError((e instanceof Error ? e.message : String(e)));
    }
  };

  const handleCopyClick = () => {
    if (textareaRef.current) {
       navigator.clipboard.writeText(result).then(() => {
        setIsCopied(true);
        toast({
          title: 'Copied!',
          description: 'The result has been copied to your clipboard.',
        });
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        toast({
          title: 'Error',
          description: 'Failed to copy text.',
          variant: 'destructive'
        });
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background text-foreground">
      <Toaster />
      <div className="w-full max-w-md p-6 space-y-6 bg-card shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center text-primary">AES Cipher</h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea 
            placeholder="Enter text (for encryption) or hex ciphertext with prepended IV (for decryption)" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Input 
            type="text"
            placeholder="Enter 32, 48, or 64-char hex key" 
            value={key} 
            onChange={(e) => setKey(e.target.value.toLowerCase())}
            className="font-mono"
          />
        </div>

        <div className="flex space-x-4">
          <Button onClick={() => process(true)} className="w-full">Encrypt</Button>
          <Button onClick={() => process(false)} className="w-full" variant="outline">Decrypt</Button>
        </div>

        <div className="relative">
          <Textarea 
            readOnly 
            placeholder="Result (Hex: IV + Ciphertext for encryption)" 
            value={result} 
            ref={textareaRef} 
            className="resize-none"
            rows={4}
          />
          {result && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full text-muted-foreground hover:text-primary"
              onClick={handleCopyClick}
              aria-label="Copy result"
            >
              {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
