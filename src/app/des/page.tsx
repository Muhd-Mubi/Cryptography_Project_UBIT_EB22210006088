
'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

// DES Constants
// Initial Permutation (IP)
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17,  9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7
];

// Final Permutation (FP) - Inverse of IP
const FP = [
  40,  8, 48, 16, 56, 24, 64, 32, 39,  7, 47, 15, 55, 23, 63, 31,
  38,  6, 46, 14, 54, 22, 62, 30, 37,  5, 45, 13, 53, 21, 61, 29,
  36,  4, 44, 12, 52, 20, 60, 28, 35,  3, 43, 11, 51, 19, 59, 27,
  34,  2, 42, 10, 50, 18, 58, 26, 33,  1, 41,  9, 49, 17, 57, 25
];

// Expansion Permutation (E)
const E = [
  32,  1,  2,  3,  4,  5,  4,  5,  6,  7,  8,  9,
   8,  9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32,  1
];

// Permutation Function (P)
const P = [
  16,  7, 20, 21, 29, 12, 28, 17,  1, 15, 23, 26,  5, 18, 31, 10,
   2,  8, 24, 14, 32, 27,  3,  9, 19, 13, 30,  6, 22, 11,  4, 25
];

// S-Boxes (8 S-boxes, each 6-bit input to 4-bit output)
const S_BOXES = [
  [ // S1
    [14,  4, 13,  1,  2, 15, 11,  8,  3, 10,  6, 12,  5,  9,  0,  7],
    [ 0, 15,  7,  4, 14,  2, 13,  1, 10,  6, 12, 11,  9,  5,  3,  8],
    [ 4,  1, 14,  8, 13,  6,  2, 11, 15, 12,  9,  7,  3, 10,  5,  0],
    [15, 12,  8,  2,  4,  9,  1,  7,  5, 11,  3, 14, 10,  0,  6, 13]
  ],
  [ // S2
    [15,  1,  8, 14,  6, 11,  3,  4,  9,  7,  2, 13, 12,  0,  5, 10],
    [ 3, 13,  4,  7, 15,  2,  8, 14, 12,  0,  1, 10,  6,  9, 11,  5],
    [ 0, 14,  7, 11, 10,  4, 13,  1,  5,  8, 12,  6,  9,  3,  2, 15],
    [13,  8, 10,  1,  3, 15,  4,  2, 11,  6,  7, 12,  0,  5, 14,  9]
  ],
  [ // S3
    [10,  0,  9, 14,  6,  3, 15,  5,  1, 13, 12,  7, 11,  4,  2,  8],
    [13,  7,  0,  9,  3,  4,  6, 10,  2,  8,  5, 14, 12, 11, 15,  1],
    [13,  6,  4,  9,  8, 15,  3,  0, 11,  1,  2, 12,  5, 10, 14,  7],
    [ 1, 10, 13,  0,  6,  9,  8,  7,  4, 15, 14,  3, 11,  5,  2, 12]
  ],
  [ // S4
    [ 7, 13, 14,  3,  0,  6,  9, 10,  1,  2,  8,  5, 11, 12,  4, 15],
    [13,  8, 11,  5,  6, 15,  0,  3,  4,  7,  2, 12,  1, 10, 14,  9],
    [10,  6,  9,  0, 12, 11,  7, 13, 15,  1,  3, 14,  5,  2,  8,  4],
    [ 3, 15,  0,  6, 10,  1, 13,  8,  9,  4,  5, 11, 12,  7,  2, 14]
  ],
  [ // S5
    [ 2, 12,  4,  1,  7, 10, 11,  6,  8,  5,  3, 15, 13,  0, 14,  9],
    [14, 11,  2, 12,  4,  7, 13,  1,  5,  0, 15, 10,  3,  9,  8,  6],
    [ 4,  2,  1, 11, 10, 13,  7,  8, 15,  9, 12,  5,  6,  3,  0, 14],
    [11,  8, 12,  7,  1, 14,  2, 13,  6, 15,  0,  9, 10,  4,  5,  3]
  ],
  [ // S6
    [12,  1, 10, 15,  9,  2,  6,  8,  0, 13,  3,  4, 14,  7,  5, 11],
    [10, 15,  4,  2,  7, 12,  9,  5,  6,  1, 13, 14,  0, 11,  3,  8],
    [ 9, 14, 15,  5,  2,  8, 12,  3,  7,  0,  4, 10,  1, 13, 11,  6],
    [ 4,  3,  2, 12,  9,  5, 15, 10, 11, 14,  1,  7,  6,  0,  8, 13]
  ],
  [ // S7
    [ 4, 11,  2, 14, 15,  0,  8, 13,  3, 12,  9,  7,  5, 10,  6,  1],
    [13,  0, 11,  7,  4,  9,  1, 10, 14,  3,  5, 12,  2, 15,  8,  6],
    [ 1,  4, 11, 13, 12,  3,  7, 14, 10, 15,  6,  8,  0,  5,  9,  2],
    [ 6, 11, 13,  8,  1,  4, 10,  7,  9,  5,  0, 15, 14,  2,  3, 12]
  ],
  [ // S8
    [13,  2,  8,  4,  6, 15, 11,  1, 10,  9,  3, 14,  5,  0, 12,  7],
    [ 1, 15, 13,  8, 10,  3,  7,  4, 12,  5,  6, 11,  0, 14,  9,  2],
    [ 7, 11,  4,  1,  9, 12, 14,  2,  0,  6, 10, 13, 15,  3,  5,  8],
    [ 2,  1, 14,  7,  4, 10,  8, 13, 15, 12,  9,  0,  3,  5,  6, 11]
  ]
];

// Permuted Choice 1 (PC-1) - For Key Schedule
const PC1 = [
  57, 49, 41, 33, 25, 17,  9,  1, 58, 50, 42, 34, 26, 18,
  10,  2, 59, 51, 43, 35, 27, 19, 11,  3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,  7, 62, 54, 46, 38, 30, 22,
  14,  6, 61, 53, 45, 37, 29, 21, 13,  5, 28, 20, 12,  4
];

// Permuted Choice 2 (PC-2) - For Key Schedule
const PC2 = [
  14, 17, 11, 24,  1,  5,  3, 28, 15,  6, 21, 10,
  23, 19, 12,  4, 26,  8, 16,  7, 27, 20, 13,  2,
  41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
];

// Key shift schedule (left shifts for C and D halves in key generation)
const KEY_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// Helper Functions
const permute = (input: boolean[], table: number[]): boolean[] => {
  const output = new Array(table.length);
  for (let i = 0; i < table.length; i++) {
    output[i] = input[table[i] - 1];
  }
  return output;
};

const bytesToBits = (bytes: Uint8Array): boolean[] => {
  const bits: boolean[] = [];
  bytes.forEach(byte => {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i & 1) === 1);
    }
  });
  return bits;
};

const bitsToBytes = (bits: boolean[]): Uint8Array => {
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      if (bits[i * 8 + j]) {
        byte |= (1 << (7 - j));
      }
    }
    bytes[i] = byte;
  }
  return bytes;
};

const xor = (a: boolean[], b: boolean[]): boolean[] => {
  return a.map((val, i) => val !== b[i]); // XOR is inequality for booleans
};

const leftShift = (bits: boolean[], count: number): boolean[] => {
  const res = [...bits];
  for (let i = 0; i < count; i++) {
    res.push(res.shift()!);
  }
  return res;
};

const sBoxLookup = (input6Bits: boolean[], boxIndex: number): boolean[] => {
  const sbox = S_BOXES[boxIndex];
  const row = parseInt(`${Number(input6Bits[0])}${Number(input6Bits[5])}`, 2);
  const col = parseInt(input6Bits.slice(1, 5).map(Number).join(''), 2);
  const val = sbox[row][col];
  const output4Bits: boolean[] = [];
  for (let i = 3; i >= 0; i--) {
    output4Bits.push((val >> i & 1) === 1);
  }
  return output4Bits;
};

const generateSubKeys = (keyBits: boolean[]): boolean[][] => {
  const subKeys: boolean[][] = [];
  let C = permute(keyBits, PC1).slice(0, 28);
  let D = permute(keyBits, PC1).slice(28, 56);

  for (let round = 0; round < 16; round++) {
    const shiftAmount = KEY_SHIFTS[round];
    C = leftShift(C, shiftAmount);
    D = leftShift(D, shiftAmount);
    const CD = [...C, ...D];
    subKeys.push(permute(CD, PC2));
  }
  return subKeys;
};

const feistelFunction = (rightHalf32Bits: boolean[], subKey48Bits: boolean[]): boolean[] => {
  const expandedRight = permute(rightHalf32Bits, E);
  const xored = xor(expandedRight, subKey48Bits);
  
  let sBoxOutput: boolean[] = [];
  for (let i = 0; i < 8; i++) {
    const sixBits = xored.slice(i * 6, (i + 1) * 6);
    sBoxOutput = sBoxOutput.concat(sBoxLookup(sixBits, i));
  }
  return permute(sBoxOutput, P);
};

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
  if (paddingLength === 0 || paddingLength > data.length || paddingLength > 8) return null; 
  for (let i = data.length - paddingLength; i < data.length -1; i++) {
    if (data[i] !== paddingLength) return null; 
  }
  return data.slice(0, data.length - paddingLength);
}

const desCore = (inputBytes: Uint8Array, keyString: string, isEncrypt: boolean): Uint8Array | null => {
  if (keyString.length !== 8) {
    throw new Error('DES key must be exactly 8 characters long.');
  }
  const keyBytes = stringToUint8Array(keyString);
  const keyBits = bytesToBits(keyBytes);
  const subKeys = generateSubKeys(keyBits);

  if (!isEncrypt) subKeys.reverse();

  let paddedInputBytes = inputBytes;
  if (isEncrypt) {
    paddedInputBytes = pkcs7Pad(inputBytes, 8); // DES block size is 8 bytes (64 bits)
  }

  if (paddedInputBytes.length % 8 !== 0) {
     // This should not happen if padding is correct for encryption, or input is valid for decryption
    throw new Error("Input data length must be a multiple of 8 bytes for DES.");
  }

  const outputBytes = new Uint8Array(paddedInputBytes.length);

  for (let b = 0; b < paddedInputBytes.length; b += 8) {
    const blockBytes = paddedInputBytes.slice(b, b + 8);
    let blockBits = bytesToBits(blockBytes);
    blockBits = permute(blockBits, IP);

    let L = blockBits.slice(0, 32);
    let R = blockBits.slice(32, 64);

    for (let round = 0; round < 16; round++) {
      const prevL = [...L];
      L = [...R];
      const fResult = feistelFunction(R, subKeys[round]);
      R = xor(prevL, fResult);
    }
    
    // Final swap of L and R is part of the last round's operation for R_16 L_16
    // then FP is applied to R_16 L_16
    const combined = [...R, ...L]; // Note: R then L before FP
    const finalPermutedBits = permute(combined, FP);
    const finalBlockBytes = bitsToBytes(finalPermutedBits);
    outputBytes.set(finalBlockBytes, b);
  }
  
  if (!isEncrypt) {
    const unpadded = pkcs7Unpad(outputBytes);
    if (!unpadded) throw new Error("Decryption failed: Invalid PKCS#7 padding.");
    return unpadded;
  }

  return outputBytes;
};

const stringToUint8Array = (str: string): Uint8Array => new TextEncoder().encode(str);
const uint8ArrayToHexString = (bytes: Uint8Array): string =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

const hexStringToUint8Array = (hexStr: string): Uint8Array | null => {
  if (hexStr.length % 2 !== 0) return null;
  try {
    const bytes = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < hexStr.length; i += 2) {
      bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
      if (isNaN(bytes[i/2])) return null;
    }
    return bytes;
  } catch (e) {
    return null;
  }
};


export default function DesCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('testkey!'); 
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const handleEncrypt = () => {
    setError('');
    setResult('');
    if (key.length !== 8) {
      setError('DES key must be exactly 8 characters long.');
      return;
    }
    if (!text) {
        setError('Text cannot be empty.');
        return;
    }

    try {
      const textBytes = stringToUint8Array(text);
      const encryptedBytes = desCore(textBytes, key, true);
      if (encryptedBytes) {
        setResult(uint8ArrayToHexString(encryptedBytes));
      } else {
        setError('Encryption failed. This should not happen if inputs are valid.');
      }
    } catch (e) {
      setError('Encryption error: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleDecrypt = () => {
    setError('');
    setResult('');
    if (key.length !== 8) {
      setError('DES key must be exactly 8 characters long.');
      return;
    }
    if (!text) {
        setError('Ciphertext (hex) cannot be empty.');
        return;
    }

    try {
      const ciphertextBytes = hexStringToUint8Array(text);
      if (!ciphertextBytes) {
        setError('Invalid hexadecimal ciphertext. Ensure it contains only hex characters and has an even length.');
        return;
      }
      if (ciphertextBytes.length % 8 !== 0) {
        setError('Invalid DES ciphertext length. Must be a multiple of 8 bytes (16 hex characters).');
        return;
      }
      
      const decryptedBytes = desCore(ciphertextBytes, key, false);
      
      if (decryptedBytes) {
        try {
          setResult(new TextDecoder('utf-8', {fatal: true}).decode(decryptedBytes));
        } catch (decodeError) {
           setError('Decryption successful, but result is not valid UTF-8 text. The original data might have been binary or used a different encoding.');
           setResult(`Hex: ${uint8ArrayToHexString(decryptedBytes)} (Non-UTF8 data)`);
        }
      } else {
        // This path should ideally be caught by exceptions in desCore for padding.
        setError('Decryption failed. Check inputs, key, or padding.');
      }
    } catch (e) {
      setError('Decryption error: ' + (e instanceof Error ? e.message : String(e)));
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
        <h1 className="text-3xl font-bold text-center text-primary">DES Cipher</h1>
        <p className="text-xs text-muted-foreground text-center">
          Data Encryption Standard. Input text, get hex ciphertext. Input hex, get original text.
          Key must be 8 characters. Uses PKCS#7 padding.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea 
            placeholder="Enter text (for encryption) or hex ciphertext (for decryption)" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Input 
            type="text"
            placeholder="Enter 8-character key" 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            maxLength={8}
            className="font-mono"
          />
        </div>

        <div className="flex space-x-4">
          <Button onClick={handleEncrypt} className="w-full">Encrypt</Button>
          <Button onClick={handleDecrypt} className="w-full" variant="outline">Decrypt</Button>
        </div>

        <div className="relative">
          <Textarea 
            readOnly 
            placeholder="Result" 
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
