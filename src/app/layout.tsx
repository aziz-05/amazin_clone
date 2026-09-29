import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Toaster from '@/components/Toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: { default: 'Amazin: shop everyday essentials', template: '%s · Amazin' },
  description:
    'A full-stack e-commerce demo: search, filters, product variants, cart, validated checkout and order tracking. Built with Next.js 15.',
};

export const viewport: Viewport = { themeColor: '#0b1220' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${jakarta.variable}`}>
      <body id='top'>
        <Header />
        <main className='min-h-[60vh]'>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
