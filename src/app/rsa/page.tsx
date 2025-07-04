
'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

// Modular exponentiation: (base^exp) % mod
function power(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod;
    base = (base * base) % mod;
    exp = exp / 2n;
  }
  return res;
}

// Convert string to Uint8Array (UTF-8 byte array)
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array (UTF-8 byte array) to string
function uint8ArrayToString(arr: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(arr);
  } catch (e) {
    throw new Error("Decrypted data is not valid UTF-8. Original might have been binary or used different encoding.");
  }
}

export default function RsaCipherPage() {
  const [text, setText] = useState('');
  const [publicKeyE, setPublicKeyE] = useState('65537'); // Common e
  const [publicKeyN, setPublicKeyN] = useState('3233'); // Default n (p=61, q=53)
  const [privateKeyD, setPrivateKeyD] = useState('2753'); // d for p=61, q=53, e=17. Needs recalculation for e=65537.
                                                        // For p=61, q=53 => phi = 60*52 = 3120.
                                                        // If e=65537, it's > phi. e must be < phi.
                                                        // Let's re-evaluate defaults or guide user.
                                                        // Using current p=61, q=53, n=3233, phi=3120.
                                                        // For e=17, d=2753 is correct (17*2753 = 46801; 46801 % 3120 = 1).
                                                        // So, let's revert default e to 17 for consistency with d.
  const [pKeyE, setPKeyE] = useState('17');
  const [pKeyN, setPKeyN] = useState('3233'); // p=61, q=53
  const [privKeyD, setPrivKeyD] = useState('2753'); // d for p=61, q=53, e=17
  
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const validateInputs = (): {e: bigint, n: bigint, d: bigint} | null => {
    setError('');
    try {
      const e = BigInt(pKeyE);
      const n = BigInt(pKeyN);
      const d = BigInt(privKeyD);

      if (e <= 0n || n <= 0n || d <= 0n) {
        setError('RSA key components (e, n, d) must be positive integers.');
        return null;
      }
      if (n < 256n ) { 
         setError(`The modulus N (${n}) is too small. It must be at least 256 to encrypt single bytes. Choose larger p and q.`);
         return null;
      }
      return {e, n, d};
    } catch (err) {
      setError('Invalid RSA key components. Please enter valid BigInt numbers (no decimals or non-numeric characters).');
      return null;
    }
  };

  const encrypt = () => {
    const keys = validateInputs();
    if (!keys) return;
    if (!text) {
        setError('Text to encrypt cannot be empty.');
        return;
    }

    const {e, n} = keys;
    try {
      const byteArray = stringToUint8Array(text);
      const encryptedBlocks: bigint[] = [];

      for (let i = 0; i < byteArray.length; i++) {
        const byteValue = BigInt(byteArray[i]);
        if (byteValue >= n) {
          // This should be caught by n < 256n check earlier, but as a safeguard.
          setError(`Byte value ${byteValue} at index ${i} is greater than or equal to N (${n}). This textbook RSA cannot encrypt it. N must be larger than any individual byte value (255).`);
          return;
        }
        encryptedBlocks.push(power(byteValue, e, n));
      }
      setResult(encryptedBlocks.join(','));
      setError(''); // Clear previous errors
    } catch (err) {
      setError('Encryption error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const decrypt = () => {
    const keys = validateInputs();
    if (!keys) return;
     if (!text) {
        setError('Ciphertext (comma-separated numbers) cannot be empty.');
        return;
    }

    const {d, n} = keys;
    try {
      const encryptedCodesStr = text.split(',');
      const decryptedBytes: number[] = [];

      for (const s of encryptedCodesStr) {
        if (s.trim() === "") continue; // Skip empty strings if there are trailing commas, etc.
        const num = BigInt(s.trim());
        if (isNaN(Number(s.trim()))) throw new Error(`Invalid number in ciphertext: "${s}". Ciphertext must be comma-separated numbers.`);
        if (num >= n) {
            setError(`Ciphertext block ${num} is greater than or equal to N (${n}). This indicates a potential issue with the ciphertext or keys.`);
            return;
        }
        const decryptedBigInt = power(num, d, n);
        decryptedBytes.push(Number(decryptedBigInt)); // Convert back to number for Uint8Array
      }
      
      setResult(uint8ArrayToString(new Uint8Array(decryptedBytes)));
      setError(''); // Clear previous errors
    } catch (err) {
      setError('Decryption error: ' + (err instanceof Error ? err.message : String(err)) + ". Ensure ciphertext is comma-separated numbers and keys are correct.");
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
      <div className="w-full max-w-lg p-6 space-y-6 bg-card shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center text-primary">RSA Cipher</h1>
        
        <p className="text-xs text-muted-foreground text-center">
          This tool demonstrates the core mathematical principles of RSA. It encrypts data byte-by-byte and does not include modern padding schemes (e.g., OAEP) which are standard for secure applications. For this reason, the modulus N must be greater than 255.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea 
            placeholder="Enter text (for encryption) or comma-separated numbers (for decryption)" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="resize-none"
            rows={4}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rsa-e">Public Key (e)</Label>
              <Input id="rsa-e" type="text" placeholder="e.g., 17" value={pKeyE} onChange={(e) => setPKeyE(e.target.value)} className="font-mono" />
            </div>
            <div>
              <Label htmlFor="rsa-n">Modulus (n)</Label>
              <Input id="rsa-n" type="text" placeholder="e.g., 3233" value={pKeyN} onChange={(e) => setPKeyN(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div>
            <Label htmlFor="rsa-d">Private Key (d)</Label>
            <Input id="rsa-d" type="text" placeholder="e.g., 2753" value={privKeyD} onChange={(e) => setPrivKeyD(e.target.value)} className="font-mono" />
            <p className="text-xs text-muted-foreground mt-1">Ensure e, n, d are correctly calculated (e.g., from primes p, q). Default values: p=61, q=53, e=17.</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={encrypt} className="w-full">Encrypt</Button>
          <Button onClick={decrypt} className="w-full" variant="outline">Decrypt</Button>
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
