'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';

export default function RailFenceCipherPage() {
  const [text, setText] = useState('');
  const [rails, setRails] = useState(2);
  const [result, setResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const encrypt = () => {
    const matrix: string[][] = Array(rails)
      .fill(null)
      .map(() => []);
    let rail = 0;
    let change = 1;

    for (let i = 0; i < text.length; i++) {
      matrix[rail].push(text[i]);
      rail += change;

      if (rail === rails - 1 || rail === 0) {
        change *= -1;
      }
    }

    let encryptedText = '';
    for (let i = 0; i < rails; i++) {
      encryptedText += matrix[i].join('');
    }

    setResult(encryptedText);
  };

  const decrypt = () => {
    const matrix: string[][] = Array(rails)
      .fill(null)
      .map(() => []);
    let rail = 0;
    let change = 1;

    for (let i = 0; i < text.length; i++) {
      matrix[rail].push('*');
      rail += change;

      if (rail === rails - 1 || rail === 0) {
        change *= -1;
      }
    }

    let index = 0;
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = text[index++];
      }
    }

    let decryptedText = '';
    rail = 0;
    change = 1;
    const decryptedMatrix: string[][] = Array(rails)
      .fill(null)
      .map(() => []);

    for (let i = 0; i < text.length; i++) {
      decryptedText += matrix[rail].shift();
      rail += change;

      if (rail === rails - 1 || rail === 0) {
        change *= -1;
      }
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
      <h1 className="text-2xl font-bold mb-4">Rail Fence Cipher</h1>

      <div className="flex flex-col space-y-2 w-full max-w-md">
        <Textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
        <Input
          type="number"
          placeholder="Number of Rails"
          value={rails.toString()}
          onChange={(e) => setRails(parseInt(e.target.value))}
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
