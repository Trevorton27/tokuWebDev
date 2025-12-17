import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '@/styles/globals.css';
import NavBar from '@/modules/common/NavBar';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'TokuWebDev',
  description: 'Online school of application design, programming and AI engineering',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const theme = localStorage.getItem('tokuwebdev-theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="antialiased" suppressHydrationWarning>
          <ClientProviders>
            <NavBar />
            {children}
          </ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
