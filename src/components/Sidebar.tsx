'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, []);

  const isActive = (path: string) => {
    if (path === '/questions' && router.pathname === '/questions') return true;
    if (path === '/tags' && router.pathname === '/tags') return true;
    if (path === '/users' && router.pathname === '/users') return true;
    return false;
  };

  const NavContent = () => (
    <nav className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-800">
        <Link href="/questions" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all group-hover:scale-105">
            <span className="text-white font-extrabold text-lg">Q</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">CodeQ</h2>
            <p className="text-xs text-slate-400">Developer Community</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
            Navigation
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/questions"
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/questions')
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10 border-l-4 border-cyan-500'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  isActive('/questions')
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-700/50 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold">Questions</span>
                {isActive('/questions') && (
                  <div className="absolute right-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/tags')
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10 border-l-4 border-cyan-500'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  isActive('/tags')
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-700/50 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="font-semibold">Tags</span>
                {isActive('/tags') && (
                  <div className="absolute right-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/users')
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10 border-l-4 border-cyan-500'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  isActive('/users')
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-700/50 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-semibold">Users</span>
                {isActive('/users') && (
                  <div className="absolute right-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        {user && (
          <div className="mb-6">
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
              Quick Actions
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ask"
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold">Ask Question</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Search</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
        <div className="text-xs text-slate-500 text-center">
          <p className="mb-1">Powered by CodeQ</p>
          <p className="text-slate-600">© 2024</p>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-[88px] left-4 z-40 p-3 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg shadow-black/20 hover:shadow-cyan-500/20"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
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
      <aside className="hidden lg:block fixed left-0 top-[72px] bottom-0 w-64 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r-2 border-slate-700/50 overflow-y-auto z-30 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div className="h-full bg-gradient-to-b from-slate-800/95 via-slate-800/98 to-slate-900/95">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-[72px] bottom-0 w-64 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r-2 border-slate-700/50 overflow-y-auto z-50 transform transition-transform duration-300 ease-out shadow-2xl shadow-black/50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-gradient-to-b from-slate-800/95 via-slate-800/98 to-slate-900/95">
          <NavContent />
        </div>
      </aside>
    </>
  );
}

