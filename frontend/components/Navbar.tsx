'use client';

import React from 'react';
import { Sparkles, User, Bell, Search, ExternalLink } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-md border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">CareerPilot AI</h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full uppercase">
              Zerops Native
            </span>
          </div>
          <p className="text-xs text-gray-400">AI Job Search & Career CRM</p>
        </div>
      </div>

      {/* Center Search / Status */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-400">
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <span>Search jobs, companies, or applications...</span>
        <kbd className="ml-4 px-1.5 py-0.5 text-[10px] font-mono bg-gray-800 text-gray-400 rounded">⌘K</kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </button>

        <div className="h-4 w-px bg-gray-800" />

        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium text-xs">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white">Alex Morgan</p>
            <p className="text-[11px] text-gray-400">SRE / DevOps Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
