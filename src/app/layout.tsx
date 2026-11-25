import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ADYK ZUOG — Vendor Compliance, Simplified',
  description:
    'ADYK ZUOG helps businesses manage vendor documents, track expiry dates, collect renewals and stay compliance-ready from one simple workspace.',
  keywords: [
    'vendor compliance',
    'document management',
    'Indian MSME',
    'manufacturing compliance',
    'GST certificate tracking',
    'ISO compliance',
    'renewal tracking',
    'ADYK ZUOG',
  ],
  icons: {
    icon: '/adyk-zuog-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
