import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.log('Failed to parse user data');
        }
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="profile-index-container">
      {/* Hero Section */}
      <div className="profile-index-hero">
        <div className="profile-index-hero-content">
          <h1 className="profile-index-hero-title">
            Ask. Learn. Grow.
          </h1>
          <p className="profile-index-hero-subtitle">
            Connect with developers worldwide. Ask questions, share knowledge, and solve problems together.
          </p>
          {!user ? (
            <div className="profile-index-hero-actions">
              <Link 
                href="/register" 
                className="profile-index-hero-button-primary"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="profile-index-hero-button-secondary"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link 
              href="/ask" 
              className="profile-index-hero-button-primary"
            >
              📝 Ask Your Question
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-index-main">
        <div className="profile-index-grid">
          {/* Questions Section - Left */}
          <div className="profile-index-main-content">
            <div className="profile-index-questions-header">
              <h2 className="profile-index-questions-title">Latest Questions</h2>
              <Link 
                href="/search" 
                className="profile-index-see-all-link"
              >
                See all <span>→</span>
              </Link>
            </div>

            <div className="profile-index-questions-list">
              {[1, 2, 3, 4].map((i) => (
                <Link 
                  key={i}
                  href={`/questions/${i}`}
                  className="profile-index-question-card"
                >
                  <div className="profile-index-question-content">
                    <div className="profile-index-question-main">
                      <h3 className="profile-index-question-title">
                        How to use React hooks effectively?
                      </h3>
                      <p className="profile-index-question-body">
                        I'm trying to use useState and useEffect but I'm getting unexpected behavior. Can someone explain the best practices?
                      </p>
                      <div className="profile-index-question-tags">
                        <span className="profile-index-question-tag">React</span>
                        <span className="profile-index-question-tag">JavaScript</span>
                      </div>
                    </div>
                    <div className="profile-index-question-stats">
                      <div className="profile-index-question-stat-value">12</div>
                      <div className="profile-index-question-stat-label">votes</div>
                      <div className="profile-index-question-stat-value profile-index-question-stat-margin">3</div>
                      <div className="profile-index-question-stat-label">answers</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="profile-index-sidebar">
            <div className="profile-index-sidebar-section">
              {/* Popular Tags */}
              <div className="profile-index-sidebar-card">
                <h3 className="profile-index-sidebar-card-title">Popular Tags</h3>
                <div className="profile-index-tags-list">
                  {['React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS', 'Next.js', 'Python'].map((tag) => (
                    <span 
                      key={tag}
                      className="profile-index-tag-item"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="profile-index-sidebar-card">
                <h3 className="profile-index-sidebar-card-title">Top Contributors</h3>
                <div className="profile-index-contributors-list">
                  {[
                    { name: 'sarah_dev', rep: 1250, icon: '👩‍💻' },
                    { name: 'john_smith', rep: 980, icon: '👨‍💻' },
                    { name: 'alex_coder', rep: 750, icon: '🧑‍💻' },
                  ].map((contributor) => (
                    <Link 
                      key={contributor.name}
                      href={`/profile/${contributor.name}`}
                      className="profile-index-contributor-item"
                    >
                      <div className="profile-index-contributor-info">
                        <span className="profile-index-contributor-icon">{contributor.icon}</span>
                        <span className="profile-index-contributor-name">{contributor.name}</span>
                      </div>
                      <span className="profile-index-contributor-rep">⭐ {contributor.rep}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="profile-index-stats-card">
                <h3 className="profile-index-stats-title">Community Stats</h3>
                <div className="profile-index-stats-list">
                  <div className="profile-index-stat-item">
                    <span>Questions</span>
                    <span className="profile-index-stat-label">2,450+</span>
                  </div>
                  <div className="profile-index-stat-item">
                    <span>Answers</span>
                    <span className="profile-index-stat-label">8,930+</span>
                  </div>
                  <div className="profile-index-stat-item">
                    <span>Members</span>
                    <span className="profile-index-stat-label">1,240+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
