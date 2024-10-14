"use client";

import React from 'react';
import Board from '@/components/Board';
import { AuthProvider } from '@/lib/contexts/AuthContext';

export default function Home() {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-gray-900 text-white">
        <Board />
      </main>
    </AuthProvider>
  );
}
