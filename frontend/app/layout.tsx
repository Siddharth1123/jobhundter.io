'use client';

import React from 'react';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>CareerPilot AI — AI Career Operating System & Job CRM</title>
        <meta name="description" content="AI-powered Job Search & Career Management CRM for SRE, DevOps & Software Engineers." />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen">
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
