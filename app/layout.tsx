import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIBC Client Portal',
  description: 'AI Business Centers — Client Dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AIBC Portal',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0D2A4A" />
      </head>
      <body className="min-h-screen bg-[#071829] text-[#E6E9ED] antialiased">
        {children}
      </body>
    </html>
  );
}
