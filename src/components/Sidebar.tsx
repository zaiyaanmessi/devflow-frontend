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
    <nav className="sidebar-nav">
      {/* Header Section */}
      <div className="sidebar-header">
        <Link href="/questions" className="sidebar-header-link">
          <div className="sidebar-logo-container">
            <span className="sidebar-logo-text">Q</span>
          </div>
          <div className="sidebar-header-info">
            <h2 className="sidebar-brand-title">CodeQ</h2>
            <p className="sidebar-brand-subtitle">Developer Community</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-main-nav">
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">
            <span className="sidebar-section-indicator"></span>
            Navigation
          </h3>
          <ul className="sidebar-nav-list">
            <li>
              <Link
                href="/questions"
                className={`sidebar-nav-item ${isActive('/questions') ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="sidebar-nav-icon-wrapper">
                  <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="sidebar-nav-text">Questions</span>
                {isActive('/questions') && (
                  <div className="sidebar-nav-active-indicator"></div>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className={`sidebar-nav-item ${isActive('/tags') ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="sidebar-nav-icon-wrapper">
                  <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="sidebar-nav-text">Tags</span>
                {isActive('/tags') && (
                  <div className="sidebar-nav-active-indicator"></div>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className={`sidebar-nav-item ${isActive('/users') ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="sidebar-nav-icon-wrapper">
                  <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="sidebar-nav-text">Users</span>
                {isActive('/users') && (
                  <div className="sidebar-nav-active-indicator"></div>
                )}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        {user && (
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              <span className="sidebar-section-indicator"></span>
              Quick Actions
            </h3>
            <ul className="sidebar-nav-list">
              <li>
                <Link
                  href="/ask"
                  className="sidebar-quick-action-item"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="sidebar-quick-action-icon-wrapper ask">
                    <svg className="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="sidebar-quick-action-text">Ask Question</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="sidebar-quick-action-item"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="sidebar-quick-action-icon-wrapper search">
                    <svg className="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="sidebar-quick-action-text">Search Stack Overflow</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-content">
          <p className="sidebar-footer-text">Powered by CodeQ</p>
          <p className="sidebar-footer-copyright">© 2025</p>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="sidebar-mobile-button"
        aria-label="Toggle menu"
      >
        <svg className="sidebar-mobile-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop">
        <div className="sidebar-desktop-wrapper">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`sidebar-mobile ${isMobileOpen ? 'open' : ''}`}
      >
        <div className="sidebar-mobile-wrapper">
          <NavContent />
        </div>
      </aside>
    </>
  );
}
