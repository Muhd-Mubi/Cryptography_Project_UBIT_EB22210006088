
'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

export default function ColumnarCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const getColumnOrder = (key: string): number[] => {
    const keyChars = key.split('').map((char, index) => ({ char, index }));
    keyChars.sort((a, b) => a.char.localeCompare(b.char));
    return keyChars.map(item => item.index);
  };

  const processCipher = (isEncrypt: boolean) => {
    setError('');
    setResult('');

    if (!text) {
      setError('Text cannot be empty.');
      return;
    }
    if (!key) {
      setError('Key cannot be empty.');
      return;
    }

    const sanitizedKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (sanitizedKey.length === 0) {
        setError('Key must contain at least one alphabetic character.');
        return;
    }
    // Check for duplicate characters in key
    if (new Set(sanitizedKey).size !== sanitizedKey.length) {
        setError('Key must not contain duplicate characters.');
        return;
    }

    const sanitizedText = text.toUpperCase().replace(/[^A-Z]/g, '');
    const numCols = sanitizedKey.length;
    const columnOrder = getColumnOrder(sanitizedKey);

    if (isEncrypt) {
      const numRows = Math.ceil(sanitizedText.length / numCols);
      const paddedLength = numRows * numCols;
      const paddedText = sanitizedText.padEnd(paddedLength, 'X');
      
      const grid: string[][] = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
      
      for (let i = 0; i < paddedText.length; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        grid[row][col] = paddedText[i];
      }

      let encryptedText = '';
      for (const col of columnOrder) {
        for (let row = 0; row < numRows; row++) {
          encryptedText += grid[row][col];
        }
      }
      setResult(encryptedText);

    } else { // Decrypt
      if (sanitizedText.length % numCols !== 0) {
        setError('Invalid ciphertext length for the given key. Ciphertext length must be a multiple of the key length.');
        return;
      }
      const numRows = sanitizedText.length / numCols;
      const grid: string[][] = Array(numRows).fill(null).map(() => Array(numCols).fill(''));
      
      let cipherIndex = 0;
      for (const col of columnOrder) {
        for (let row = 0; row < numRows; row++) {
          grid[row][col] = sanitizedText[cipherIndex++];
        }
      }

      let decryptedText = '';
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          decryptedText += grid[row][col];
        }
      }
      setResult(decryptedText);
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
        <h1 className="text-3xl font-bold text-center text-primary">Columnar Transposition Cipher</h1>
        <p className="text-xs text-muted-foreground text-center">
            A transposition cipher that rearranges characters. The key determines the column order. Plaintext is padded with 'X' to form a rectangle. The key should not have repeating characters.
        </p>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea
            placeholder="Enter text (A-Z only)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Input
            type="text"
            placeholder="Enter keyword (no repeating characters)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="flex space-x-4">
          <Button onClick={() => processCipher(true)} className="w-full">Encrypt</Button>
          <Button onClick={() => processCipher(false)} className="w-full" variant="outline">Decrypt</Button>
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
