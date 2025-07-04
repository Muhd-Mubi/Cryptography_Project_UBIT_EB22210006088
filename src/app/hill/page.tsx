
'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

// Helper function for modular inverse (for determinant)
function modInverse(a: number, m: number): number {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return -1; // No modular inverse
}

// Helper function for matrix determinant (mod m)
function determinant(matrix: number[][], m: number): number {
  const n = matrix.length;
  if (n === 0) return 0; // Should not happen with validation
  if (n === 1) return matrix[0][0];
  if (n === 2) return ((matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % m + m) % m;
  
  let det = 0;
  for (let j = 0; j < n; j++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
    const sign = (j % 2 === 0) ? 1 : -1;
    det = (det + sign * matrix[0][j] * determinant(subMatrix, m) % m + m) % m;
  }
  return (det % m + m) % m;
}

// Helper function for matrix adjugate (mod m)
function adjugate(matrix: number[][], m: number): number[][] {
  const n = matrix.length;
  if (n === 0) return []; // Should not happen
  if (n === 1) return [[1]];
  
  const adj = Array(n).fill(null).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const subMatrix = matrix
        .filter((_, rowIndex) => rowIndex !== i)
        .map(row => row.filter((_, colIndex) => colIndex !== j));
      const sign = ((i + j) % 2 === 0) ? 1 : -1;
      adj[j][i] = (sign * determinant(subMatrix, m) % m + m) % m; // Transposed
    }
  }
  return adj;
}

// Helper function for matrix inverse (mod m)
function matrixInverseMod(matrix: number[][], m: number): number[][] | null {
  const n = matrix.length;
  if (n === 0) return null;
  const det = determinant(matrix, m);
  const detInv = modInverse(det, m);

  if (detInv === -1) {
    return null; // Matrix is not invertible
  }

  const adj = adjugate(matrix, m);
  const invMatrix = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      invMatrix[i][j] = (adj[i][j] * detInv % m + m) % m;
    }
  }
  return invMatrix;
}


export default function HillCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('17 17 5\n21 18 21\n2 2 19'); // Default 3x3 key
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const parseKeyMatrix = (keyStr: string): number[][] | null => {
    try {
      const rows = keyStr.trim().split('\n');
      if (rows.length === 0 || rows[0].trim() === "") {
        setError('Key matrix cannot be empty.');
        return null;
      }
      const matrix = rows.map(row => row.trim().split(/\s+/).map(Number));
      
      const n = matrix.length;
      if (n === 0) { 
          setError('Key matrix cannot be empty.');
          return null;
      }

      if (matrix.some(row => row.length !== n || row.some(val => isNaN(val) || !Number.isInteger(val)) )) {
        setError('Invalid key matrix format. Must be a square matrix of integers (e.g., "2 1\\n1 1" for 2x2). Each row must have the same number of columns as there are rows.');
        return null;
      }
      return matrix;
    } catch (e) {
      setError('Error parsing key matrix. Ensure it is correctly formatted.');
      return null;
    }
  };

  // Implements Ciphertext_vector = Plaintext_vector * Key_Matrix (mod m)
  // P (block) is treated as a row vector. K (keyMatrix) is the key matrix.
  // C_j = sum_i (P_i * K_ij) mod m
  const processBlock = (block: number[], keyMatrix: number[][], m: number): number[] => {
    const n = keyMatrix.length; // Assuming square matrix of size n x n, and block.length == n
    const resultBlock: number[] = new Array(n).fill(0);

    for (let j = 0; j < n; j++) { // Iterate for each element of the output ciphertext vector (corresponds to column j of Key_Matrix)
      let sum = 0;
      for (let i = 0; i < n; i++) { // Iterate for each element of the input plaintext vector (P_i) and corresponding row i of Key_Matrix
        sum += block[i] * keyMatrix[i][j]; // P_i * K_ij
      }
      resultBlock[j] = ((sum % m) + m) % m;
    }
    return resultBlock;
  };

  const hillCipher = (inputText: string, keyMatrix: number[][], mode: 'encrypt' | 'decrypt') => {
    setError('');
    setResult('');
    const m = 26; // Modulo for alphabet size
    const n = keyMatrix.length;

    if (n === 0) { 
        setError('Key matrix is invalid.');
        return;
    }

    let effectiveKeyMatrix = keyMatrix;
    if (mode === 'decrypt') {
      // For P_row = C_row * K_inv_row_convention
      // K_inv standard calculation is fine. The multiplication convention is handled by processBlock.
      const invKey = matrixInverseMod(keyMatrix, m);
      if (!invKey) {
        setError('Key matrix is not invertible modulo 26. Cannot decrypt. Ensure the determinant is coprime to 26.');
        return;
      }
      effectiveKeyMatrix = invKey;
    }
    
    const preparedText = inputText.toUpperCase().replace(/[^A-Z]/g, '');
    if (preparedText.length === 0) {
        setError('Text cannot be empty or contain only non-alphabetic characters. Please use A-Z.');
        return;
    }

    let paddedText = preparedText;
    while (paddedText.length % n !== 0) {
      paddedText += 'X'; // Padding character
    }

    let outputText = '';
    for (let i = 0; i < paddedText.length; i += n) {
      const blockChars = paddedText.slice(i, i + n);
      const blockNums = blockChars.split('').map(char => char.charCodeAt(0) - 'A'.charCodeAt(0));
      
      const processedBlockNums = processBlock(blockNums, effectiveKeyMatrix, m);
      outputText += processedBlockNums.map(num => String.fromCharCode(num + 'A'.charCodeAt(0))).join('');
    }
    setResult(outputText);
  };


  const encrypt = () => {
    const matrix = parseKeyMatrix(key);
    if (matrix) {
      hillCipher(text, matrix, 'encrypt');
    }
  };

  const decrypt = () => {
    const matrix = parseKeyMatrix(key);
    if (matrix) {
      hillCipher(text, matrix, 'decrypt');
    }
  };
  
  const handleCopyClick = () => {
    if (textareaRef.current) {
      // textareaRef.current.select(); // select() can be problematic with readOnly fields or specific browsers
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
        <h1 className="text-3xl font-bold text-center text-primary">Hill Cipher</h1>
        <p className="text-xs text-muted-foreground text-center">
          The size of the square key matrix (e.g., 2x2 for digraphs, 3x3 for trigraphs) determines the block size.
          The key matrix must be invertible modulo 26. Only A-Z characters are processed.
          Plaintext blocks are treated as row vectors multiplied by the key matrix on the right (P * K).
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
          <Textarea 
            placeholder="Enter key matrix (e.g., for a 3x3 matrix:\n17 17 5\n21 18 21\n2 2 19\nEach row on a new line, numbers separated by spaces)" 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            className="resize-none font-mono"
            rows={Math.max(2, key.split('\n').length)} 
          />
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
