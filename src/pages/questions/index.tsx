'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';

export default function QuestionsPage() {
  const router = useRouter();
  const { tag } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [filter, setFilter] = useState<'newest' | 'popular' | 'trending' | 'unanswered'>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const QUESTIONS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        router.push('/');
        return;
      }
      
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        router.push('/');
      }
    }
  }, [router]);

  // Handle tag from URL query
  useEffect(() => {
    if (tag && typeof tag === 'string') {
      setSelectedTag(tag);
    } else {
      setSelectedTag(null);
    }
  }, [tag]);

  useEffect(() => {
    if (mounted && user) {
      fetchQuestions();
    }
  }, [page, mounted, user, filter, selectedTag]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: QUESTIONS_PER_PAGE,
      };

      // Add tag filter if selected
      if (selectedTag) {
        params.tags = selectedTag;
      }

      // Map filter to API sort parameter
      if (filter === 'unanswered') {
        // Try different parameter names the API might accept
        params.unanswered = true;
        params.answerCount = 0;
        params.sort = 'newest';
      } else if (filter === 'popular') {
        params.sort = 'votes';
        params.order = 'desc';
      } else if (filter === 'trending') {
        params.sort = 'trending';
        params.order = 'desc';
      } else {
        // newest
        params.sort = 'newest';
        params.order = 'desc';
      }

      const response = await api.get('/questions', { params });

      let questions = response.data.questions || [];
      
      // Client-side filtering for unanswered (ensure accuracy)
      if (filter === 'unanswered') {
        questions = questions.filter((q: any) => {
          const answerCount = q.answerCount || q.answers?.length || 0;
          return answerCount === 0;
        });
      }

      // Client-side sorting to ensure accuracy regardless of API response
      if (filter === 'popular') {
        questions.sort((a: any, b: any) => {
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          if (bVotes !== aVotes) return bVotes - aVotes;
          // If votes are equal, sort by newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filter === 'newest') {
        questions.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filter === 'trending') {
        // Trending: combination of votes and recency
        questions.sort((a: any, b: any) => {
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          const aIsNew = isNewQuestion(a.createdAt);
          const bIsNew = isNewQuestion(b.createdAt);
          
          // Boost new questions
          const aScore = aVotes + (aIsNew ? 10 : 0);
          const bScore = bVotes + (bIsNew ? 10 : 0);
          
          if (bScore !== aScore) return bScore - aScore;
          // If scores are equal, sort by newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      setQuestions(questions);
      setTotalPages(response.data.totalPages || 1);
      setTotalQuestions(response.data.total || 0);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'newest' | 'popular' | 'trending' | 'unanswered') => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when filter changes
  };

  const isNewQuestion = (createdAt: string) => {
    const questionDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - questionDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="main-with-sidebar">
        <div className="questions-page-container">
        {/* Page Header - Better Proportions */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {selectedTag ? (
                <>
                  Questions tagged <span className="text-cyan-400">[{selectedTag}]</span>
                </>
              ) : (
                <>
                  {filter === 'newest' && 'Newest Questions'}
                  {filter === 'popular' && 'Active Questions'}
                  {filter === 'trending' && 'Trending Questions'}
                  {filter === 'unanswered' && 'Unanswered Questions'}
                </>
              )}
            </h1>
            {selectedTag && (
              <button
                onClick={() => {
                  setSelectedTag(null);
                  router.push('/questions', undefined, { shallow: true });
                }}
                className="ml-auto px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm font-medium transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <p className="text-xl font-normal text-gray-400 tracking-normal">
              {totalQuestions.toLocaleString()} {totalQuestions === 1 ? 'question' : 'questions'} from the community
            </p>
            {/* Filter Options - Right Aligned */}
            <div className="filter-bar-container">
              <div className="filter-container">
                <div
                  onClick={() => handleFilterChange('newest')}
                  className={`filter-option ${filter === 'newest' ? 'filter-option-active' : ''}`}
                >
                  Newest
                </div>
                <div
                  onClick={() => handleFilterChange('popular')}
                  className={`filter-option ${filter === 'popular' ? 'filter-option-active' : ''}`}
                >
                  Active
                </div>
                <div
                  onClick={() => handleFilterChange('trending')}
                  className={`filter-option ${filter === 'trending' ? 'filter-option-active' : ''}`}
                >
                  Trending
                </div>
                <div
                  onClick={() => handleFilterChange('unanswered')}
                  className={`filter-option ${filter === 'unanswered' ? 'filter-option-active' : ''}`}
                >
                  Unanswered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/15 border-l-4 border-red-400 text-red-300 p-6 rounded-r-xl mb-10 sm:mb-12">
            <p className="font-medium text-base tracking-normal">⚠️ {error}</p>
          </div>
        )}

        {/* Loading - Skeleton Loader */}
        {loading && questions.length === 0 ? (
          <div className="space-y-10 sm:space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-8 animate-pulse">
                <div className="flex gap-10">
                  <div className="flex flex-col gap-4 min-w-24">
                    <div className="bg-slate-700 rounded-lg h-20"></div>
                    <div className="bg-slate-700 rounded-lg h-20"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-700 rounded h-8 mb-4 w-3/4"></div>
                    <div className="bg-slate-700 rounded h-4 mb-2 w-full"></div>
                    <div className="bg-slate-700 rounded h-4 mb-6 w-5/6"></div>
                    <div className="flex gap-2 mb-6">
                      <div className="bg-slate-700 rounded-md h-6 w-16"></div>
                      <div className="bg-slate-700 rounded-md h-6 w-20"></div>
                    </div>
                    <div className="bg-slate-700 rounded h-4 w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-20 sm:p-24 md:p-32 lg:p-40 text-center">
            <div className="text-8xl mb-12 sm:mb-16">📝</div>
            <h3 className="text-4xl font-extrabold text-white mb-8 sm:mb-10 tracking-tight">No questions yet</h3>
            <p className="text-gray-400 text-xl font-normal mb-16 sm:mb-20 max-w-md mx-auto tracking-normal">Be the first to ask a question and start a discussion!</p>
            <Link 
              href="/ask"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-bold hover:from-cyan-400 hover:to-blue-400 active:scale-95 transition-all duration-200 shadow-lg"
            >
              Ask Question
            </Link>
          </div>
        ) : (
          <>
            {/* Questions List - MAJOR REDESIGN */}
            <div className="space-y-3 mt-8 sm:mt-12">
              {questions.map((q: any, index: number) => (
                <article
                  key={q._id}
                  className="bg-slate-800/50 border border-slate-700 rounded question-card cursor-pointer hover:bg-slate-800/70 transition-colors duration-200 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link href={`/questions/${q._id}`} className="block focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Left Column - Metadata */}
                      <div className="flex flex-row md:flex-col gap-4 md:gap-2 md:min-w-[120px] md:items-end">
                        {/* Question Type Icon */}
                        <div className="flex items-center gap-2 text-right-md">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-slate-400 font-medium text-right-md">Question</span>
                        </div>
                        
                        {/* Stats - Plain Text */}
                        <div className="flex flex-row md:flex-col gap-2 md:gap-1 text-sm text-slate-300 text-right-md">
                          <div className="font-normal text-right-md">
                            <span className="font-semibold">{q.votes || 0}</span> votes
                          </div>
                          <div className="font-normal text-right-md">
                            <span className="font-semibold">{q.answerCount || 0}</span> replies
                          </div>
                          <div className="font-normal text-right-md">
                            <span className="font-semibold">{q.views || 0}</span> views
                          </div>
                        </div>
                      </div>

                      {/* Right: Question Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title - Light Blue */}
                        <h2 className="text-lg sm:text-xl font-normal text-cyan-400 hover:text-cyan-300 mb-3 leading-snug transition-colors duration-200">
                          {q.title}
                        </h2>
                        
                        {/* Body Preview */}
                        <p 
                          className="text-xs sm:text-sm font-normal text-slate-400 mb-4 line-clamp-2 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: q.body
                              .replace(
                                /\[your image\]\((data:image\/[^)]+)\)/g,
                                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline"><img src="$1" alt="your image" class="max-w-xs rounded mt-2 mb-2 cursor-pointer inline-block" onclick="window.open(this.src, \'_blank\')" /></a>'
                              )
                              .replace(
                                /\[([^\]]+)\]\(([^)]+)\)/g,
                                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline">$1</a>'
                              )
                          }}
                        />
                        
                        {/* Tags and Author Info Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Tags */}
                          <div className="flex gap-2 flex-wrap">
                            {q.tags?.slice(0, 3).map((tag: string) => (
                              <Link
                                key={tag}
                                href={`/questions?tag=${encodeURIComponent(tag)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setPage(1);
                                }}
                                className="bg-slate-700/50 text-cyan-300 px-2.5 py-1 rounded text-xs font-normal hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
                              >
                                {tag}
                              </Link>
                            ))}
                            {q.tags?.length > 3 && (
                              <span className="text-slate-500 text-xs px-2.5 py-1">+{q.tags.length - 3} more</span>
                            )}
                          </div>
                          
                          {/* Author Info */}
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-semibold">
                              {q.asker.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <Link 
                              href={`/profile/${q.asker._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
                            >
                              {q.asker.username}
                            </Link>
                            <span className="text-slate-500">{q.asker.reputation || 0}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500">
                              asked {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination - CLEAN */}
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