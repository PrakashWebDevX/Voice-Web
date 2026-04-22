import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from './client-providers';

export const metadata: Metadata = {
  title: 'VoiceForge — Voice to Code Generator',
  description: 'Speak or type to generate full websites, APIs, and code instantly with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-terminal text-white min-h-screen">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}