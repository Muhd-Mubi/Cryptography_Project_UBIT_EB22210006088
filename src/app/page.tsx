
'use client';

import {useState, useEffect, useRef} from 'react';
import {useTheme} from 'next-themes';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import Link from 'next/link';
import {
  Copy,
  Check,
  KeyRound,
  Fence,
  ShieldQuestion,
  LockKeyhole,
  LetterText,
  Table,
  ShieldCheck,
  Fingerprint,
  Shield,
  LayoutGrid,
} from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


interface Cipher {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CipherCardProps {
  cipher: Cipher;
}

const ciphers: Cipher[] = [
  {
    name: 'Caesar Cipher',
    href: '/caesar',
    description: 'A simple substitution cipher where each letter is shifted by a fixed number of positions.',
    icon: LetterText,
  },
  {
    name: 'One-Time Pad Cipher',
    href: '/one-time-pad',
    description: 'An encryption technique where each plaintext letter is encrypted with a random key of the same length.',
    icon: KeyRound,
  },
  {
    name: 'Rail Fence Cipher',
    href: '/rail-fence',
    description: 'A transposition cipher that writes plaintext letters diagonally along a number of rails.',
    icon: Fence,
  },
  {
    name: 'Playfair Cipher',
    href: '/playfair',
    description: 'A digraph substitution cipher that encrypts pairs of letters (digraphs) instead of single letters.',
    icon: ShieldQuestion,
  },
  {
    name: 'Vigenère Cipher',
    href: '/vigenere',
    description: 'A polyalphabetic substitution cipher that uses a keyword to encrypt the message.',
    icon: LockKeyhole,
  },
  {
    name: 'Hill Cipher',
    href: '/hill',
    description: 'A polyalphabetic substitution cipher using linear algebra, specifically matrix multiplication.',
    icon: Table,
  },
  {
    name: 'Columnar Cipher',
    href: '/columnar',
    description: 'A transposition cipher that rearranges plaintext into columns based on a keyword.',
    icon: LayoutGrid,
  },
  {
    name: 'DES Cipher',
    href: '/des',
    description: 'Data Encryption Standard, a symmetric-key block cipher. (Full 64-bit implementation)',
    icon: ShieldCheck,
  },
  {
    name: 'RSA Cipher',
    href: '/rsa',
    description: 'A public-key cryptosystem for secure data transmission. (Textbook, byte-wise version)',
    icon: Fingerprint,
  },
  {
    name: 'AES Cipher',
    href: '/aes',
    description: 'A symmetric block cipher supporting AES-128, 192, and 256 key sizes in CBC mode.',
    icon: Shield,
  },
];

const CipherCard: React.FC<CipherCardProps> = ({cipher}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 rounded-xl flex flex-col bg-card text-card-foreground">
      <Link href={cipher.href} className="flex flex-col h-full">
        <div className="p-6 flex-grow">
          <div className="flex items-center space-x-3 mb-3">
            <cipher.icon className="h-7 w-7 text-primary" />
            <h2 className="text-xl font-semibold">{cipher.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{cipher.description}</p>
        </div>
        <div className="p-4 mt-auto border-t border-border">
          <Button variant="outline" className="w-full rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
            Go to {cipher.name}
          </Button>
        </div>
      </Link>
    </Card>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const {theme, setTheme} = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode.`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 lg:p-8 bg-background text-foreground transition-colors duration-300">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 text-primary">Mubashir Cryptography Lab</h1>
        <p className="text-lg text-muted-foreground">
          Explore various encryption and decryption techniques.
        </p>
        <div className="mt-6 flex justify-center items-center space-x-2">
          <label htmlFor="theme-toggle" className="text-sm font-medium text-muted-foreground">
            {mounted && theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </label>
          <Switch
            id="theme-toggle"
            checked={mounted ? theme === 'dark' : false}
            onCheckedChange={toggleTheme}
            disabled={!mounted}
            aria-label="Toggle theme"
          />
        </div>
      </header>

      <main className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ciphers.map((cipher) => (
            <CipherCard key={cipher.name} cipher={cipher} />
          ))}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
