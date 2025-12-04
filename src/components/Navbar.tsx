'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkUserStatus();
  }, []);

  // Check user status on every route change
  useEffect(() => {
    checkUserStatus();
  }, [router.asPath]);

  const checkUserStatus = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('User found in navbar:', parsedUser.username, 'Role:', parsedUser.role);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse user:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            DevFlow
          </Link>

          {/* Navigation */}
          <div className="flex gap-6 items-center">
            {user ? (
              <>
                <Link href="/ask" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  Ask
                </Link>
                <Link href={`/profile/${user._id}`} className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  Profile
                </Link>
                
                {/* Admin Dashboard Link */}
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-red-600 hover:text-red-700 font-semibold transition-colors bg-red-50 px-3 py-1 rounded">
                    👨‍💼 Admin
                  </Link>
                )}
                
                {/* Expert Dashboard Link */}
                {user.role === 'expert' && (
                  <Link href="/expert" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors bg-purple-50 px-3 py-1 rounded">
                    👨‍🏫 Expert
                  </Link>
                )}
                
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-gray-700 font-semibold">{user.username}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    user.role === 'admin' ? 'bg-red-100 text-red-900' :
                    user.role === 'expert' ? 'bg-purple-100 text-purple-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {user.role === 'admin' ? '👨‍💼 Admin' : 
                     user.role === 'expert' ? '👨‍🏫 Expert' : 
                     '👤 Student'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-semibold bg-red-50 px-4 py-2 rounded transition-colors hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors px-4 py-2 rounded hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 rounded">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}