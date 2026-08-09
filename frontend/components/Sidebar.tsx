'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  CalendarDays,
  FileText,
  TrendingUp,
  Bot,
  User,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs Discovery', href: '/jobs', icon: Briefcase },
  { name: 'Application CRM', href: '/applications', icon: Kanban },
  { name: 'Interviews', href: '/interviews', icon: CalendarDays },
  { name: 'Resumes', href: '/resumes', icon: FileText },
  { name: 'Career Insights', href: '/insights', icon: TrendingUp },
  { name: 'AI Career Coach', href: '/coach', icon: Bot },
  { name: 'Candidate Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#090d16] border-r border-gray-800 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-2">
          Career Operating System
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 text-xs">
        <div className="flex items-center justify-between text-blue-400 font-semibold mb-1">
          <span>Zerops Hackathon</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
          Deploy multi-service Python & Next.js apps with managed DB on Zerops.
        </p>
        <a
          href="https://zerops.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:underline"
        >
          <span>View Zerops Spec</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
