import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'newest' | 'popular'>('newest');

  // Check if user is logged in
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          setUser(null);
        }
      }
    }
  }, []);

  // Fetch questions (public - no auth required)
  useEffect(() => {
    if (mounted) {
      fetchQuestions();
    }
  }, [mounted, filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 10,
      };

      if (filter === 'popular') {
        params.sort = 'votes';
      } else {
        params.sort = 'newest';
      }

      const response = await api.get('/questions', { params });
      let questions = response.data.questions || [];

      // Client-side sorting
      if (filter === 'popular') {
        questions.sort((a: any, b: any) => {
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          if (bVotes !== aVotes) return bVotes - aVotes;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else {
        questions.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      setQuestions(questions);
      setError('');
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ⭐ REMOVED: Navbar - now handled by _app.tsx */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
        {/* Hero Section - Only show to anonymous users */}
        {!user && (
          <div className="mb-12 sm:mb-16">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-2xl p-8 sm:p-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Welcome to <span className="text-cyan-400">CodeQ</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                A community-driven Q&A platform where students ask questions and experts provide answers. 
                Learn from others and help the community!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-center"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Personalized welcome for logged-in users */}
        {user && (
          <div className="mb-8 sm:mb-12 bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-cyan-400">{user.username}</span>! 👋
            </h1>
            <p className="text-slate-400 mb-4">Your reputation: <span className="text-cyan-400 font-semibold">⭐ {user.reputation || 0}</span></p>
            <Link
              href="/ask"
              className="inline-block px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Ask a Question
            </Link>
          </div>
        )}

        {/* Questions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Latest Questions
            </h2>
            <Link
              href="/questions"
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm sm:text-base"
            >
              View all →
            </Link>
          </div>

          {/* Filter Options */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('newest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'newest'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'popular'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Popular
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                    <div className="h-6 bg-slate-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-lg">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q: any) => (
                <article
                  key={q._id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 hover:bg-slate-800/70 transition-colors group"
                >
                  <Link href={`/questions/${q._id}`} className="block">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Stats - Left Side */}
                      <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 sm:min-w-[100px]">
                        <div className="text-sm">
                          <div className="font-semibold text-white">{q.votes || 0}</div>
                          <div className="text-xs text-slate-400">votes</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-white">{q.answerCount || 0}</div>
                          <div className="text-xs text-slate-400">answers</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-white">{q.views || 0}</div>
                          <div className="text-xs text-slate-400">views</div>
                        </div>
                      </div>

                      {/* Content - Right Side */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 mb-2 line-clamp-2">
                          {q.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {q.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {q.tags?.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="bg-slate-700/50 text-cyan-300 px-2 py-1 rounded text-xs hover:bg-cyan-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                          {q.tags?.length > 3 && (
                            <span className="text-slate-500 text-xs px-2 py-1">+{q.tags.length - 3}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          Asked by{' '}
                          <Link
                            href={`/profile/${q.asker._id}`}
                            className="text-cyan-400 hover:text-cyan-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {q.asker.username}
                          </Link>
                          {' '} on {new Date(q.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action - Bottom Section */}
        {!user && (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-8 sm:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to join the community?</h3>
            <p className="text-slate-300 mb-6">Sign up to ask questions and help others learn</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-center"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors text-center"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}