import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Tapbon',
  description: 'Digitale kvitteringer — tap, gem, færdig.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const grotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk'
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-receipt'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="da"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${grotesk.variable} ${mono.variable} ${grotesk.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <NextIntlClientProvider>
          <SWRConfig
            value={{
              fallback: {
                // We do NOT await here
                // Only components that read this data will suspend
                '/api/user': getUser(),
                '/api/team': getTeamForUser()
              }
            }}
          >
            {children}
          </SWRConfig>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
