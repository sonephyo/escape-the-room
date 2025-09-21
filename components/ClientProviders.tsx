'use client';
import React from 'react';
import { AgoraProvider } from '@/lib/akool/AgoraProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AgoraProvider>{children}</AgoraProvider>;
}
