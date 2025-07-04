'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check, RefreshCw} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

export default function OneTimePadCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const generatePad = () => {
    if (text.length === 0) {
      setError("Cannot generate a pad for empty text. Please enter some plaintext first.");
      return;
    }
    setError('');
    const randomBytes = new Uint8Array(text.length);
    crypto.getRandomValues(randomBytes);
    
    let pad = '';
    // Using a loop to avoid stack depth issues with String.fromCharCode.apply
    for (let i = 0; i < randomBytes.length; i++) {
        pad += String.fromCharCode(randomBytes[i]);
    }
    setKey(pad);
  };
  
  const processCipher = (isEncrypt: boolean) => {
    setError('');
    if (text.length === 0) {
      setError("Text cannot be empty.");
      return;
    }
    if (text.length !== key.length) {
      setError(`Key length must match text length. Text is ${text.length} characters, but key is ${key.length} characters.`);
      return;
    }

    let outputText = '';
    for (let i = 0; i < text.length; i++) {
      const textCode = text.charCodeAt(i);
      const keyCode = key.charCodeAt(i);
      let outputCode;
      if (isEncrypt) {
        outputCode = (textCode + keyCode) % 256;
      } else { // Decrypt
        outputCode = (textCode - keyCode + 256) % 256;
      }
      outputText += String.fromCharCode(outputCode);
    }
    setResult(outputText);
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
        <h1 className="text-3xl font-bold text-center text-primary">One-Time Pad Cipher</h1>
        <p className="text-xs text-muted-foreground text-center">
          A theoretically unbreakable cipher if the pad is truly random, used only once, and as long as the message.
          Click the "Generate Random Pad" button to create a cryptographically secure pad.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea 
            placeholder="Enter plaintext" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="resize-none"
            rows={4}
          />
          <div className="space-y-2">
            <Textarea 
              placeholder="Enter pad (key) or generate one" 
              value={key} 
              onChange={(e) => setKey(e.target.value)}
              className="resize-none font-mono"
              rows={4}
            />
            <Button onClick={generatePad} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Random Pad
            </Button>
          </div>
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