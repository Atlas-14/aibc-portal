import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIBC Client Portal',
  description: 'AI Business Centers — Client Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#071829] text-[#E6E9ED] antialiased">
        {children}
      </body>
    </html>
  );
}
