'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';

export default function CaesarCipherPage() {
  const [text, setText] = useState('');
  const [shift, setShift] = useState(3); // Set default shift to 3
  const [result, setResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const encrypt = () => {
    let encryptedText = '';
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        let shiftedCode;
        if (char === char.toUpperCase()) {
          shiftedCode = ((code - 65 + shift) % 26 + 26) % 26 + 65;
        } else {
          shiftedCode = ((code - 97 + shift) % 26 + 26) % 26 + 97;
        }
        char = String.fromCharCode(shiftedCode);
      }
      encryptedText += char;
    }
    setResult(encryptedText);
  };

  const decrypt = () => {
    let decryptedText = '';
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        let shiftedCode;
        if (char === char.toUpperCase()) {
          shiftedCode = ((code - 65 - shift) % 26 + 26) % 26 + 65;
        } else {
          shiftedCode = ((code - 97 - shift) % 26 + 26) % 26 + 97;
        }
        char = String.fromCharCode(shiftedCode);
      }
      decryptedText += char;
    }
    setResult(decryptedText);
  };

  const handleCopyClick = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'The result has been copied to your clipboard.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Caesar Cipher</h1>

      <div className="flex flex-col space-y-2 w-full max-w-md">
        <Textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
        <Input
          type="number"
          placeholder="Shift Key"
          value={shift.toString()}
          onChange={(e) => setShift(parseInt(e.target.value))}
        />

        <div className="flex space-x-2">
          <Button onClick={encrypt}>Encrypt</Button>
          <Button onClick={decrypt}>Decrypt</Button>
        </div>

        <div className="relative">
          <Textarea readOnly placeholder="Result" value={result} ref={textareaRef} />
          {result && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full"
              onClick={handleCopyClick}
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
