'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';

export default function PlayfairCipherPage() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {toast} = useToast();

  const prepareText = (text: string) => {
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if (text.length % 2 !== 0) {
      text += 'X';
    }
    return text;
  };

  const createKeyTable = (key: string) => {
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    let keyTable: string[] = [];
    let usedLetters: { [key: string]: boolean } = {};

    for (let char of key) {
      if (!usedLetters[char]) {
        keyTable.push(char);
        usedLetters[char] = true;
      }
    }

    for (let i = 65; i <= 90; i++) {
      let char = String.fromCharCode(i);
      if (char === 'J') continue;
      if (!usedLetters[char]) {
        keyTable.push(char);
        usedLetters[char] = true;
      }
    }

    let table: string[][] = [];
    for (let i = 0; i < 5; i++) {
      table[i] = keyTable.slice(i * 5, i * 5 + 5);
    }
    return table;
  };

  const findPosition = (table: string[][], letter: string) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (table[i][j] === letter) {
          return {row: i, col: j};
        }
      }
    }
    return {row: -1, col: -1};
  };

  const encrypt = () => {
    let preparedText = prepareText(text);
    let table = createKeyTable(key);
    let encryptedText = '';

    for (let i = 0; i < preparedText.length; i += 2) {
      let char1 = preparedText[i];
      let char2 = preparedText[i + 1];

      let pos1 = findPosition(table, char1);
      let pos2 = findPosition(table, char2);

      if (pos1.row === pos2.row) {
        encryptedText += table[pos1.row][(pos1.col + 1) % 5];
        encryptedText += table[pos2.row][(pos2.col + 1) % 5];
      } else if (pos1.col === pos2.col) {
        encryptedText += table[(pos1.row + 1) % 5][pos1.col];
        encryptedText += table[(pos2.row + 1) % 5][pos2.col];
      } else {
        encryptedText += table[pos1.row][pos2.col];
        encryptedText += table[pos2.row][pos1.col];
      }
    }

    setResult(encryptedText);
  };

  const decrypt = () => {
    let preparedText = prepareText(text);
    let table = createKeyTable(key);
    let decryptedText = '';

    for (let i = 0; i < preparedText.length; i += 2) {
      let char1 = preparedText[i];
      let char2 = preparedText[i + 1];

      let pos1 = findPosition(table, char1);
      let pos2 = findPosition(table, char2);

      if (pos1.row === pos2.row) {
        decryptedText += table[pos1.row][(pos1.col + 4) % 5];
        decryptedText += table[pos2.row][(pos2.col + 4) % 5];
      } else if (pos1.col === pos2.col) {
        decryptedText += table[(pos1.row + 4) % 5][pos1.col];
        decryptedText += table[(pos2.row + 4) % 5][pos2.col];
      } else {
        decryptedText += table[pos1.row][pos2.col];
        decryptedText += table[pos2.row][pos1.col];
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
      <h1 className="text-2xl font-bold mb-4">Playfair Cipher</h1>

      <div className="flex flex-col space-y-2 w-full max-w-md">
        <Textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
        <Input placeholder="Key" value={key} onChange={(e) => setKey(e.target.value)} />

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
