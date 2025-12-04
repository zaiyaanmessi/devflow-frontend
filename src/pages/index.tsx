'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import api from '@/services/api';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const QUESTIONS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.log('Failed to parse user');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchQuestions();
    }
  }, [page, mounted]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions, page:', page);

      const response = await api.get('/questions', {
        params: {
          page,
          limit: QUESTIONS_PER_PAGE,
          sort: 'newest'
        }
      });

      console.log('Questions response:', response.data);

      setQuestions(response.data.questions || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalQuestions(response.data.total || 0);
      setError('');
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 leading-tight">Ask. Learn. Grow.</h1>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Connect with developers worldwide. Ask questions, share knowledge, and solve problems together.
          </p>
          {!user ? (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 text-lg shadow-lg">
                Get Started Free
              </Link>
              <Link href="/login" className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all text-lg">
                Sign In
              </Link>
            </div>
          ) : (
            <Link href="/ask" className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 text-lg shadow-lg">
              📝 Ask Your Question
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Latest Questions</h2>
              <Link href="/search" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                See all <span>→</span>
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-6 border border-red-300">
                {error}
              </div>
            )}

            {loading && questions.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No questions found. Be the first to ask!
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((q: any) => (
                    <Link
                      key={q._id}
                      href={`/questions/${q._id}`}
                      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 mb-2">
                            {q.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {q.body}
                          </p>
                          <div className="flex gap-3 items-center flex-wrap">
                            {q.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            Asked by{' '}
                            <Link
                              href={`/profile/${q.asker._id}`}
                              className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              {q.asker.username}
                            </Link>
                          </div>
                        </div>
                        <div className="text-right min-w-20">
                          <div className="text-2xl font-bold text-gray-900">{q.votes || 0}</div>
                          <div className="text-xs text-gray-600">votes</div>
                          <div className="text-2xl font-bold text-gray-900 mt-3">{q.answerCount || 0}</div>
                          <div className="text-xs text-gray-600">answers</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * QUESTIONS_PER_PAGE + 1}-{Math.min(page * QUESTIONS_PER_PAGE, totalQuestions)} of {totalQuestions} questions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS', 'Next.js'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?tags=${tag.toLowerCase()}`}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span className="font-bold">{totalQuestions}+</span>
                </div>
                <div className="flex justify-between">
                  <span>Answers</span>
                  <span className="font-bold">Coming soon</span>
                </div>
                <div className="flex justify-between">
                  <span>Members</span>
                  <span className="font-bold">Growing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}