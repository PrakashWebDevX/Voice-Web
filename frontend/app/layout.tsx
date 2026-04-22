'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/useAuth';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>VoiceForge — Voice to Code Generator</title>
        <meta name="description" content="Speak or type to generate full websites, APIs, and code instantly with AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-terminal text-white min-h-screen">
        <AuthProvider>
          <NavbarWrapper />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#e8e8e8',
                border: '1px solid #2a2a2a',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#39FF14', secondary: '#0a0a0a' },
              },
              error: {
                iconTheme: { primary: '#ff4444', secondary: '#0a0a0a' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

function NavbarWrapper() {
  const pathname = usePathname();
  const hideNav = ['/login', '/signup'].includes(pathname);
  if (hideNav) return null;
  return <Navbar />;
}
