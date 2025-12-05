'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/questions' && router.pathname === '/questions') return true;
    if (path === '/tags' && router.pathname === '/tags') return true;
    if (path === '/users' && router.pathname === '/users') return true;
    return false;
  };

  const NavContent = () => (
    <nav className="p-4">
      <ul className="space-y-1">
        <li>
          <Link
            href="/questions"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/questions')
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            onClick={() => setIsMobileOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Questions
          </Link>
        </li>
        <li>
          <Link
            href="/tags"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tags')
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            onClick={() => setIsMobileOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tags
          </Link>
        </li>
        <li>
          <Link
            href="/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/users')
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            onClick={() => setIsMobileOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </Link>
        </li>
      </ul>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Public
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/questions"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Questions
            </Link>
          </li>
          <li>
            <Link
              href="/tags"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags
            </Link>
          </li>
          <li>
            <Link
              href="/users"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-[88px] left-4 z-40 p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[72px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-[72px] bottom-0 w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto z-30">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-[72px] bottom-0 w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}

