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
      
      console.log('🔍 Navbar checkUserStatus called');
      console.log('📦 localStorage user:', userData);
      
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Parsed user:', parsedUser);
          console.log('✅ Reputation:', parsedUser.reputation);
          setUser(parsedUser);
        } catch (err) {
          console.error('❌ Failed to parse user:', err);
          setUser(null);
        }
      } else {
        console.log('⚠️ No user data or token found');
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkUserStatus();
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🎨 Navbar user state updated:', user);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link href="/" className="navbar-logo-link navbar-logo">
            <span className="navbar-logo-text">CodeQ</span>
          </Link>

          {/* Center Search - Hidden on mobile */}
          <div className="navbar-search-container">
            <div className="navbar-search-wrapper">
              <div className="navbar-search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="navbar-search-input search-bar-input"
                placeholder="Search questions..."
                type="search"
              />
              <button
                onClick={handleSearchClick}
                className="navbar-search-button"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Actions - Right Aligned */}
          <div className="navbar-right-actions">
            {mounted && user ? (
              <>
                {/* Ask Button */}
                <Link
                  href="/ask"
                  className="navbar-link"
                >
                  Ask Question
                </Link>

                {/* Profile Link */}
                <Link
                  href={`/profile/${user._id}`}
                  className="navbar-profile-link"
                >
                  Profile
                </Link>

                {/* User Badge */}
                <div className="navbar-user-badge">
                  <span className="navbar-username">{user.username}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="navbar-logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Sign In Link */}
                <Link
                  href="/login"
                  className="navbar-signin-link"
                >
                  Sign In
                </Link>

                {/* Sign Up Button */}
                <Link
                  href="/register"
                  className="navbar-signup-button"
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