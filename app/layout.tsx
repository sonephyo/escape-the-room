import * as React from 'react';


export const metadata = {
  title: '',
  description: 'Campus game demo',
};

import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import GlobalExitButtons from '@/components/GlobalExitButtons';
import { Audiowide } from "next/font/google";

const audiowide = Audiowide({
  weight: "400",                 // Audiowide ships as a single regular weight
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  variable: "--font-audiowide",  // optional: use as a CSS variable
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={audiowide.variable}>
      <body className='bg-black'>
        <ClientProviders>
          <GlobalExitButtons />
          {children}
          </ClientProviders>
        </body>
    </html>
  );
}
