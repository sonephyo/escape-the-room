import * as React from 'react';

export const metadata = {
  title: 'Cornell Quest',
  description: 'Campus game demo',
};

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
