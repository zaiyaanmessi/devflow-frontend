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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-blue-900 hover:text-blue-800">
          💻 DevFlow
        </Link>

        <input
          type="text"
          placeholder="Search questions..."
          className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearch}
        />

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {user.username} (Rep: {user.reputation})
              </span>
              <Link href="/ask" className="text-blue-900 font-medium hover:underline">
                📝 Ask
              </Link>
              <Link href="/profile" className="text-blue-900 font-medium hover:underline">
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-900 font-medium hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-blue-900 font-medium hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}