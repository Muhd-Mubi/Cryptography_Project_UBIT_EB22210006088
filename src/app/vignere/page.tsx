  'use client';

  import {useState, useRef} from 'react';
  import {Button} from '@/components/ui/button';
  import {Input} from '@/components/ui/input';
  import {Textarea} from '@/components/ui/textarea';
  import {useToast} from '@/hooks/use-toast';
  import {Copy, Check} from 'lucide-react';
  import { Toaster } from "@/components/ui/toaster";
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

  export default function VigenereCipherPage() {
    const [text, setText] = useState('');
    const [key, setKey] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {toast} = useToast();

    const processCipher = (isEncrypt: boolean) => {
      setError('');
      if (!text) {
          setError('Text cannot be empty.');
          return;
      }
      if (!key) {
          setError('Key cannot be empty.');
          return;
      }

      const sanitizedKey = key.toUpperCase().replace(/[^A-Z]/g, "");
      if (sanitizedKey.length === 0) {
          setError("Key must contain at least one alphabetic character.");
          return;
      }
      
      let outputText = '';
      let keyIndex = 0;

      for (let i = 0; i < text.length; i++) {
        let char = text[i];

        if (char.match(/[a-z]/i)) {
          const textCode = text.charCodeAt(i);
          const keyCode = sanitizedKey.charCodeAt(keyIndex % sanitizedKey.length);
          const shift = keyCode - 65;

          let outputCode;
          if (isEncrypt) {
            if (char === char.toUpperCase()) {
              outputCode = ((textCode - 65 + shift) % 26) + 65;
            } else {
              outputCode = ((textCode - 97 + shift) % 26) + 97;
            }
          } else { // Decrypt
            if (char === char.toUpperCase()) {
              outputCode = ((textCode - 65 - shift + 26) % 26) + 65;
            } else {
              outputCode = ((textCode - 97 - shift + 26) % 26) + 97;
            }
          }
          char = String.fromCharCode(outputCode);
          keyIndex++;
        }

        outputText += char;
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
              <h1 className="text-3xl font-bold text-center text-primary">Vigenère Cipher</h1>
              <p className="text-xs text-muted-foreground text-center">
                  A polyalphabetic substitution cipher. The keyword is repeated to match the length of the plaintext. Non-alphabetic characters are ignored.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                  <Textarea 
                      placeholder="Enter text" 
                      value={text} 
                      onChange={(e) => setText(e.target.value)}
                      className="resize-none"
                      rows={4}
                  />
                  <Input 
                      placeholder="Enter keyword (e.g., 'KEY')" 
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