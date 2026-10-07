'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/context/authContext';
import SignInPrompt from '@/components/SigninPrompt';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GoogleOAuthProvider clientId={googleClientId!}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <SignInPrompt />
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  'flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-indigo p-4 text-white shadow-2xl shadow-black/40',
                title: 'text-sm font-semibold text-white',
                description: 'mt-0.5 text-xs text-[#AEB6CC]',
                icon: 'text-emerald-400',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}