'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/useAuth';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideNav = ['/login', '/signup'].includes(pathname);

    return (
        <AuthProvider>
            {!hideNav && <Navbar />}
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
    );
}