'use client';

import {useEffect, useState} from 'react';
import dynamic from 'next/dynamic';

const ThemeProvider = dynamic(() => import('next-themes').then((mod) => mod.ThemeProvider), {
  ssr: false,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ClientLayout({children}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted ? (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
