// app/layout.jsx
import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import ScriptLoader from '@/components/loader/ScriptLoader';
import { LanguageProvider } from '@/contexts/LanguageContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Toponus Indoor Navigation',
  description: 'Indoor Navigation Assistant',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/favicon.svg',
    apple: '/assets/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Toponus',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: '#1B3349',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <link rel="apple-touch-icon" href="/assets/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${poppins.className} ${poppins.variable}`}>
        <LanguageProvider>
          <ScriptLoader />
          {children}
          <PWAInstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}