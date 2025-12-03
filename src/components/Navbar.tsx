'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.log('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-6">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-2xl font-bold text-white hover:text-blue-100 transition-colors"
        >
          <span className="text-3xl">💻</span>
          <span>DevFlow</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full px-4 py-2 rounded-lg bg-blue-50 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
        </div>

        {/* Right Menu */}
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <div className="bg-blue-700 px-3 py-1 rounded-full text-sm text-white">
                <span className="font-medium">{user.username}</span>
                <span className="ml-2 text-blue-100">⭐ {user.reputation}</span>
              </div>
              <Link 
                href="/ask" 
                className="text-white font-medium hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                📝 Ask
              </Link>
              <Link 
                href="/profile" 
                className="text-white font-medium hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-white font-medium hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-white text-blue-900 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}