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
  reputation: number;
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
  const [sortBy, setSortBy] = useState<'reputation' | 'newest' | 'name'>('reputation');
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
      
      // Fetch all questions to get user data
      const questionsResponse = await api.get('/questions', { 
        params: { page: 1, limit: 1000 }
      });
      
      const questions = questionsResponse.data.questions || [];
      
      // Extract unique users from questions
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
        
        // Count answers
        if (q.answers && Array.isArray(q.answers)) {
          q.answers.forEach((answer: any) => {
            if (answer.answerer) {
              const userId = answer.answerer._id;
              if (!userMap[userId]) {
                userMap[userId] = {
                  _id: userId,
                  username: answer.answerer.username,
                  email: answer.answerer.email || '',
                  reputation: answer.answerer.reputation || 0,
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
      
      // Convert to array
      let usersArray = Object.values(userMap);
      
      // Sort
      if (sortBy === 'reputation') {
        usersArray.sort((a, b) => b.reputation - a.reputation);
      } else if (sortBy === 'newest') {
        usersArray.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        usersArray.sort((a, b) => a.username.localeCompare(b.username));
      }
      
      // Pagination
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
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="main-with-sidebar">
        <div className="questions-page-container">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Users
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <p className="text-xl font-normal text-gray-400 tracking-normal">
                Community members
              </p>
              <div className="flex gap-4 items-center">
                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="px-4 py-2 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'reputation' | 'newest' | 'name');
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  <option value="reputation">Reputation</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/15 border-l-4 border-red-400 text-red-300 p-6 rounded-r-xl mb-10 sm:mb-12">
              <p className="font-medium text-base tracking-normal">⚠️ {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && users.length === 0 ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="bg-slate-700 rounded h-5 w-32 mb-2"></div>
                      <div className="bg-slate-700 rounded h-4 w-48"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-20 sm:p-24 md:p-32 lg:p-40 text-center">
              <div className="text-8xl mb-12 sm:mb-16">👥</div>
              <h3 className="text-4xl font-extrabold text-white mb-8 sm:mb-10 tracking-tight">
                {searchQuery ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-400 text-xl font-normal mb-16 sm:mb-20 max-w-md mx-auto tracking-normal">
                {searchQuery 
                  ? `No users match "${searchQuery}"`
                  : 'Users will appear here as they create questions and answers.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Link
                    key={user._id}
                    href={`/profile/${user._id}`}
                    className="block bg-slate-800/80 border-2 border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {user.username}
                          </h3>
                          {user.role && user.role !== 'user' && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.role === 'expert' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                : 'bg-red-500/20 text-red-300 border border-red-500/50'
                            }`}>
                              {user.role === 'expert' ? '👨‍🏫 Expert' : '👨‍💼 Admin'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {user.reputation || 0} reputation
                          </span>
                          {user.questionsCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {user.questionsCount} {user.questionsCount === 1 ? 'question' : 'questions'}
                            </span>
                          )}
                          {user.answersCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {user.answersCount} {user.answersCount === 1 ? 'answer' : 'answers'}
                            </span>
                          )}
                          <span className="text-slate-500">
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
                <div className="flex justify-center items-center gap-4 sm:gap-6 mt-20 sm:mt-24 pt-16 sm:pt-20 border-t border-slate-700 flex-wrap">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-slate-800 border-2 border-slate-700 text-white font-semibold hover:bg-slate-700 hover:border-cyan-500/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-base sm:text-lg"
                  >
                    ← Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 text-base sm:text-lg ${
                          page === pageNum
                            ? 'bg-cyan-500 text-white shadow-lg hover:bg-cyan-400 border-2 border-cyan-500'
                            : 'bg-slate-800 border-2 border-slate-700 text-gray-300 hover:bg-slate-700 hover:border-cyan-500/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-slate-800 border-2 border-slate-700 text-white font-semibold hover:bg-slate-700 hover:border-cyan-500/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-base sm:text-lg"
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

