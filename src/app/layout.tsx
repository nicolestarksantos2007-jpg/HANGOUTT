import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A192F',
};

export const metadata: Metadata = {
  title: 'Hangout Dashboard | Gestão de Cultos & Vidas',
  description: 'Sistema oficial de gestão de cultos, ministérios, voluntários e visitantes do Hangout',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-[#F8FAFC] text-[#0A192F]">
        {children}
      </body>
    </html>
  );
}
