'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';

interface User {
  _id: string;
  username: string;
  email: string;
  reputation?: number;
  role: string;
  createdAt: string;
  questionsCount?: number;
  answersCount?: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const questionsResponse = await api.get('/questions', { 
        params: { page: 1, limit: 1000 }
      });
      
      const questions = questionsResponse.data.questions || [];
      
      const userMap: { [key: string]: User & { questionsCount: number; answersCount: number } } = {};
      
      questions.forEach((q: any) => {
        if (q.asker) {
          const userId = q.asker._id;
          if (!userMap[userId]) {
            userMap[userId] = {
              _id: userId,
              username: q.asker.username,
              email: q.asker.email || '',
              reputation: q.asker.reputation || 0,
              role: q.asker.role || 'user',
              createdAt: q.asker.createdAt || q.createdAt,
              questionsCount: 0,
              answersCount: 0,
            };
          }
          userMap[userId].questionsCount = (userMap[userId].questionsCount || 0) + 1;
        }
        
        if (q.answers && Array.isArray(q.answers)) {
          q.answers.forEach((answer: any) => {
            if (answer.answerer) {
              const userId = answer.answerer._id;
              if (!userMap[userId]) {
                userMap[userId] = {
                  _id: userId,
                  username: answer.answerer.username,
                  email: answer.answerer.email || '',
                  role: answer.answerer.role || 'user',
                  createdAt: answer.answerer.createdAt || answer.createdAt,
                  questionsCount: 0,
                  answersCount: 0,
                };
              }
              userMap[userId].answersCount = (userMap[userId].answersCount || 0) + 1;
            }
          });
        }
      });
      
      let usersArray = Object.values(userMap);
      
      if (sortBy === 'newest') {
        usersArray.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        usersArray.sort((a, b) => a.username.localeCompare(b.username));
      }
      
      const total = usersArray.length;
      setTotalPages(Math.ceil(total / USERS_PER_PAGE));
      const start = (page - 1) * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE;
      usersArray = usersArray.slice(start, end);
      
      setUsers(usersArray);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-page-container">
      <Sidebar />
      <main className="main-with-sidebar">
        <div className="questions-page-container">
          {/* Page Header */}
          <div className="users-page-header">
            <div className="users-page-header-row">
              <h1 className="users-page-title">
                Users
              </h1>
            </div>
            <div className="users-page-header-info">
              <p className="users-page-description-text">
                Community members
              </p>
              <div className="users-page-controls">
                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="users-page-search-input"
                />
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'newest' | 'name');
                    setPage(1);
                  }}
                  className="users-page-sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="questions-page-error">
              <p className="questions-page-error-text">⚠️ {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && users.length === 0 ? (
            <div className="users-skeleton-container">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="users-skeleton-card">
                  <div className="users-skeleton-content">
                    <div className="users-skeleton-avatar"></div>
                    <div className="users-skeleton-info">
                      <div className="users-skeleton-username"></div>
                      <div className="users-skeleton-meta"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="questions-page-empty">
              <div className="questions-page-empty-emoji">👥</div>
              <h3 className="questions-page-empty-title">
                {searchQuery ? 'No users found' : 'No users yet'}
              </h3>
              <p className="questions-page-empty-text">
                {searchQuery 
                  ? `No users match "${searchQuery}"`
                  : 'Users will appear here as they create questions and answers.'}
              </p>
            </div>
          ) : (
            <>
              <div className="users-list">
                {filteredUsers.map((user) => (
                  <Link
                    key={user._id}
                    href={`/profile/${user._id}`}
                    className="users-card"
                  >
                    <div className="users-card-content">
                      {/* Avatar */}
                      <div className="users-card-avatar">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      {/* User Info */}
                      <div className="users-card-info">
                        <div className="users-card-header">
                          <h3 className="users-card-username">
                            {user.username}
                          </h3>
                          {user.role && user.role !== 'user' && (
                            <span className={`users-card-role-badge ${user.role}`}>
                              {user.role === 'expert' ? '👨‍🏫 Expert' : '👨‍💼 Admin'}
                            </span>
                          )}
                        </div>
                        <div className="users-card-meta">
                          {user.questionsCount !== undefined && (
                            <span className="users-card-meta-item">
                              <svg className="users-card-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {user.questionsCount} {user.questionsCount === 1 ? 'question' : 'questions'}
                            </span>
                          )}
                          {user.answersCount !== undefined && (
                            <span className="users-card-meta-item">
                              <svg className="users-card-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {user.answersCount} {user.answersCount === 1 ? 'answer' : 'answers'}
                            </span>
                          )}
                          <span className="users-card-meta-date">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="users-pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="users-pagination-button"
                  >
                    ← Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`users-pagination-number ${page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="users-pagination-button"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
