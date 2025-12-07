'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const checkUserStatus = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkUserStatus();
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Search on Enter key
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSearchClick = () => {
    // Search on button click
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-800 border-b-2 border-slate-700 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center navbar-logo">
            <span className="text-cyan-400 font-extrabold text-2xl">CodeQ</span>
          </Link>

          {/* Center Search - Hidden on mobile */}
          <div className="hidden md:flex md:flex-1 md:justify-center md:px-8">
            <div className="w-full max-w-lg relative flex gap-2">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 rounded-lg bg-slate-700/80 text-white placeholder:text-slate-400 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500 transition search-bar-input pl-10"
                placeholder="Search Stack Overflow questions..."
                type="search"
              />
              <button
                onClick={handleSearchClick}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Actions - Right Aligned */}
          <div className="ml-auto flex items-center gap-4">
            {mounted && user ? (
              <>
                {/* Ask Button - TEXT ONLY, NO BACKGROUND */}
                <Link
                  href="/ask"
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors hover:underline underline-offset-4"
                >
                  Ask Question
                </Link>

                {/* Profile Link - PLAIN TEXT */}
                <Link
                  href={`/profile/${user._id}`}
                  className="hidden sm:inline text-slate-300 hover:text-white transition-colors hover:underline underline-offset-4"
                >
                  Profile
                </Link>

                {/* User Badge - LARGER, MORE READABLE */}
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-lg bg-slate-700/80 border-2 border-slate-600 shadow-lg shadow-black/20">
                  <span className="text-white text-base font-bold">{user.username}</span>
                  <span className="text-cyan-400 text-sm font-bold">⭐ {user.reputation || 0}</span>
                </div>

                {/* Logout - TEXT ONLY */}
                <button
                  onClick={handleLogout}
                  className="text-red-400 font-semibold hover:text-red-300 transition-colors hover:underline underline-offset-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Sign In Link - For Anonymous Users */}
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white font-semibold transition-colors hover:underline underline-offset-4"
                >
                  Sign In
                </Link>

                {/* Sign Up Button - For Anonymous Users */}
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}