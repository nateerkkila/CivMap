import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // Import the provider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Civilian Resource Map',
  description: 'Register and view mission-critical resources.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire app in the AuthProvider */}
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}